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

module=$(go list -m)
time=$(date -u "+%Y-%m-%dT%H:%M:%SZ")
hash=$(git rev-parse HEAD)
goVer=$(go version | sed -r 's/.*go([0-9.]+).*/\1/g')

flag1="-X '$module/config.buildDate=$time'"
flag2="-X '$module/config.gitCommitHash=$hash'"
flag3="-X '$module/config.goVersion=$goVer'"
flags="-s -w $flag1 $flag2 $flag3"

echo "* go building..."

export CGO_ENABLED=0

GOOS=windows GOARCH=amd64 go build -ldflags="$flags" -o .dist/$name.win64.exe
GOOS=windows GOARCH=386 go build -ldflags="$flags" -o .dist/$name.win32.exe
GOOS=linux GOARCH=amd64 go build -ldflags="$flags" -o .dist/$name.linux
GOOS=darwin GOARCH=amd64 go build -ldflags="$flags" -o .dist/$name.macos
GOOS=android GOARCH=arm64 go build -ldflags="$flags" -o .dist/$name.android

echo "* Built completed."

cd .dist

if [ x$1 == x-upx ]; then
    echo "* Upx compressing..."
    upx --lzma --best $name.*
    echo "* Upx compressing completed."
fi

sha256sum $name.* >sha256sum.txt

popd >/dev/null 2>&1
