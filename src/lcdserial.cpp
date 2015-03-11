#include <node.h>
#include <nan.h>
#include <v8.h>
#include <fcntl.h>
#include <termios.h>
#include <unistd.h>
#include <stdarg.h>
#include <string>

using namespace v8;

int handle = 0;

/**
 * Sends a single byte to the display.
 */
void sendByte(unsigned char data) {
	// some characters don't map properly in the cgrom, so we need to fix them
	// refer to the docs for more info:
	// https://www.crystalfontz.com/products/document/342/CFA-634_v2.0.pdf
	if (data == '[') {
		data = 250;
	} else if (data == ']') {
		data = 252;
	}

	if (::write(handle, &data, 1) != 1) {
		return NanThrowError(Exception::Error(NanNew("write() failed")));
	}
}

/**
 * Sends a string to the display.
 */
void sendString(const char* msg) {
	int i = 0;
	for (; *msg && i < 20; ++i) {
		::usleep(500);
		sendByte(*msg++);
	}
	while (i++ < 20) {
		sendByte(' ');
	}
}

/**
 * Connects to the USB LCD display and initializes it.
 */
NAN_METHOD(connect) {
	if (args.Length() < 2 || !args[0]->IsString() || !args[1]->IsNumber()) {
		return NanThrowError(Exception::Error(NanNew("Missing required arguments \'device\' and \'bitRate\'")));
	}

	String::Utf8Value device(Handle<String>::Cast(args[0])->ToString());

	int bitrate = (int)args[1]->IntegerValue();
	if (bitrate != 19200 && bitrate != 115200) {
		return NanThrowError(Exception::Error(NanNew("Bit rate must be 19200 or 115200")));
	}
	bitrate = bitrate == 19200 ? B19200 : B115200;

	handle = ::open(*device, O_RDWR | O_NOCTTY | O_NONBLOCK);
	if (handle <= 0) {
		if (errno == 13) {
			return NanThrowError(Exception::Error(NanNew("Failed to open device: you must be root")));
		}
		return NanThrowError(Exception::Error(NanNew("Failed to open device")));
	}

	struct termios term;
	if (::tcgetattr(handle, &term) != 0) {
		return NanThrowError(Exception::Error(NanNew("Unable to get terminal params")));
	}

	//input modes
	term.c_iflag &= ~(IGNBRK|BRKINT|PARMRK|INPCK|ISTRIP|INLCR|IGNCR|ICRNL|IXON|IXOFF);
	term.c_iflag |= IGNPAR;

	//output modes
	term.c_oflag &= ~(OPOST|ONLCR|OCRNL|ONOCR|ONLRET|OFILL|OFDEL|NLDLY|CRDLY|TABDLY|BSDLY|VTDLY|FFDLY);

	//control modes
	term.c_cflag &= ~(CSIZE|PARENB|PARODD|HUPCL|CRTSCTS);
	term.c_cflag |= CREAD|CS8|CSTOPB|CLOCAL;

	//local modes
	term.c_lflag &= ~(ISIG|ICANON|IEXTEN|ECHO);
	term.c_lflag |= NOFLSH;

	::cfsetospeed(&term, bitrate);
	::cfsetispeed(&term, bitrate);

	if (::tcsetattr(handle, TCSANOW, &term) != 0) {
		return NanThrowError(Exception::Error(NanNew("Unable to set terminal params")));
	}

	sendByte(20); // turn off scroll
	sendByte(24); // turn off wrap

	NanReturnUndefined();
}

/**
 * Prints a line of text.
 */
NAN_METHOD(printLine) {
	if (handle <= 0) {
		return NanThrowError(Exception::Error(NanNew("Not connected")));
	}

	if (args.Length() < 2 || !args[0]->IsNumber() || !args[1]->IsString()) {
		return NanThrowError(Exception::Error(NanNew("Missing required arguments \'lineNumber\' and \'message\'")));
	}

	int line = (int)args[0]->IntegerValue();
	if (line < 0 || line > 3) {
		return NanThrowError(Exception::Error(NanNew("line number must be between 0 and 3")));
	}

	String::Utf8Value msg(Handle<String>::Cast(args[1])->ToString());

	sendByte(17);
	sendByte(0);
	sendByte(line);
	sendString(*msg);
}

/**
 * Clears a line on the display.
 */
NAN_METHOD(clearLine) {
	if (handle <= 0) {
		return NanThrowError(Exception::Error(NanNew("Not connected")));
	}

	if (args.Length() < 1 || !args[0]->IsNumber()) {
		return NanThrowError(Exception::Error(NanNew("Missing required arguments \'lineNumber\'")));
	}

	int line = (int)args[0]->IntegerValue();
	if (line < 0 || line > 3) {
		return NanThrowError(Exception::Error(NanNew("line number must be between 0 and 3")));
	}

	sendByte(17);
	sendByte(0);
	sendByte(line);
	sendString("                    ");
}

/**
 * Wire up the APIs.
 */
void init(Handle<Function> exports) {
	exports->Set(NanNew("connect"), NanNew<FunctionTemplate>(connect)->GetFunction());
	exports->Set(NanNew("printLine"), NanNew<FunctionTemplate>(printLine)->GetFunction());
	exports->Set(NanNew("clearLine"), NanNew<FunctionTemplate>(clearLine)->GetFunction());
}

NODE_MODULE(lcdserial, init)
