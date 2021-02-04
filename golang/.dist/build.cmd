@echo off

:: Usage:
::   build
::   build -upx

setlocal

set "name=dandanplay-resource-service"

cd "%~dp0.."

echo  * go building...

set "GOOS=windows" & set "GOARCH=amd64"
go build -ldflags="-s -w" -o .dist/%name%.%GOOS%.%GOARCH%.exe

set "GOOS=windows" & set "GOARCH=386"
go build -ldflags="-s -w" -o .dist/%name%.%GOOS%.%GOARCH%.exe

set "GOOS=linux" & set "GOARCH=amd64"
go build -ldflags="-s -w" -o .dist/%name%.%GOOS%.%GOARCH%

set "GOOS=darwin" & set "GOARCH=amd64"
go build -ldflags="-s -w" -o .dist/%name%.%GOOS%.%GOARCH%

echo  * Built completed.

if "%~1"=="-upx" (
    echo  * Upx compressing...
    cd .dist
    upx --lzma --best %name%.*
    echo  * Upx compressing completed.
)

