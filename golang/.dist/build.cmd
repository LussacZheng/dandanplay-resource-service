@echo off

:: Usage:
::   build
::   build -upx

setlocal

set "name=dandanplay-resource-service"

pushd "%~dp0.."

echo  * go building...

set "GOOS=windows" & set "GOARCH=amd64"
go build -ldflags="-s -w" -o .dist/%name%.win64.exe

set "GOOS=windows" & set "GOARCH=386"
go build -ldflags="-s -w" -o .dist/%name%.win32.exe

set "GOOS=linux" & set "GOARCH=amd64"
go build -ldflags="-s -w" -o .dist/%name%.linux

set "GOOS=darwin" & set "GOARCH=amd64"
go build -ldflags="-s -w" -o .dist/%name%.macos

set "GOOS=android" & set "GOARCH=arm64"
go build -ldflags="-s -w" -o .dist/%name%.android

echo  * Built completed.

if "%~1"=="-upx" (
    echo  * Upx compressing...
    cd .dist
    upx --lzma --best %name%.*
    echo  * Upx compressing completed.
)

popd
