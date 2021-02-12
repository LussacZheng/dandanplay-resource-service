#!/bin/sh

# Usage:
#   build
#   build -upx

name=dandanplay-resource-service

root=$(
    cd "$(dirname "$0")"
    pwd
)

pushd "$root"/.. >/dev/null 2>&1

echo "* go building..."

GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o .dist/$name.win64.exe
GOOS=windows GOARCH=386 go build -ldflags="-s -w" -o .dist/$name.win32.exe
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o .dist/$name.linux
GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o .dist/$name.macos
GOOS=android GOARCH=arm64 go build -ldflags="-s -w" -o .dist/$name.android

echo "* Built completed."

cd .dist

if [ x$1 == x-upx ]; then
    echo "* Upx compressing..."
    upx --lzma --best $name.*
    echo "* Upx compressing completed."
fi

sha256sum $name.* >sha256sum.txt

popd >/dev/null 2>&1
