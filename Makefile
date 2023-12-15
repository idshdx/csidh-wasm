CC=emcc
LIB=./src
OUT_NODE=./dist/node/csidh-wasm.js
OUT_BROWSER=./dist/browser/csidh-wasm.html
# Source files for the 512 bits implementation
SOURCE_FILES=$(LIB)/csidh.c $(LIB)/mont.c $(LIB)/uint.c $(LIB)/fp.c $(LIB)/rng.c $(LIB)/p512/constants.c
WRAPPER_SRC=wrapper_csidh.c
EXTRA_LDFLAGS= #--llvm-lto 1 #linker flags
EXPORTED_FUNCTIONS='["_create_sk", "_create_pk", "_create_pk_validated", "_create_ss", "_create_ss_validated", "_check_pk", "_error_code", "_malloc", "_free"]'
EXPORTED_RUNTIME_METHODS='["getValue"]'

CFLAGS=-I$(LIB) -I$(LIB)/p512 -O3 -std=c99 -DNDEBUG -Wall -Wextra -pedantic
CFLAGS_NODE=-s ENVIRONMENT=node -s NODEJS_CATCH_EXIT=0 -s NODEJS_CATCH_REJECTION=0 -s NODERAWFS=0 \
            -fno-threadsafe-statics -fno-rtti -fno-stack-protector -fno-exceptions \
            -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s WASM_BIGINT \
            -s EXPORT_ES6=1 -s USE_ES6_IMPORT_META=1 \
            -s MODULARIZE=1 -s SINGLE_FILE=1 \
            -s NO_EXIT_RUNTIME=1 -s ABORTING_MALLOC=0 -s DISABLE_EXCEPTION_CATCHING=1 \
            --no-entry \
            -s EXPORTED_FUNCTIONS=$(EXPORTED_FUNCTIONS) \
            -s EXPORTED_RUNTIME_METHODS=$(EXPORTED_RUNTIME_METHODS)

$(OUT_NODE): $(SOURCE_FILES) $(WRAPPER_SRC)
	$(CC) $(CFLAGS) $(CFLAGS_NODE) $(EXTRA_LDFLAGS) -o $(OUT_NODE) $^
	# disable require fs, path
	perl -i -pe 's@(.* = require\(.*)@//\1@' $@

browser: $(SOURCE_FILES) $(WRAPPER_SRC)
	$(CC) $(CFLAGS) -s ENVIRONMENT=web $(EXTRA_LDFLAGS) -o $(OUT_BROWSER) $^

debug: $(SOURCE_FILES) wrapper_debug.c
	$(CC) $(CFLAGS) $(CFLAGS_NODE) $(EXTRA_LDFLAGS) -o $(OUT_NODE) $^

main: $(SOURCE_FILES) $(LIB)/main.c
	clang $(CFLAGS) -o main $^

.PHONY: clean
clean:
	rm -f $(OUT_NODE) $(OUT_BROWSER)