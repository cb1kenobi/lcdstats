{
    "targets": [
        {
            "target_name": "lcdserial",
            "sources": [ "src/lcdserial.cpp" ],
            "include_dirs" : [
                "<!(node -e \"require('nan')\")"
            ],
            'cflags!': [ '-fno-exceptions' ],
            'cflags_cc!': [ '-fno-exceptions' ]
        }
    ]
}
