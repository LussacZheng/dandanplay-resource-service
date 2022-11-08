@echo off

:: Usage:
::   build
::   build -upx

setlocal

set "name=dandanplay-resource-service"

pushd "%~dp0.."

for /f %%i in ('go list -m') do ( set "module=%%i" )
for /f "usebackq" %%i in (`powershell -command "Get-Date -Date (Get-Date).ToUniversalTime() -Format 'yyyy-MM-ddTHH:mm:ssZ'"`) do ( set "time=%%i" )
for /f %%i in ('git rev-parse HEAD') do ( set "hash=%%i" )

set "flag1=-X '%module%/config.buildDate=%time%'"
set "flag2=-X '%module%/config.gitCommitHash=%hash%'"
set "flags=-s -w %flag1% %flag2%"

echo  * go building...

set CGO_ENABLED=0

set "GOOS=windows" & set "GOARCH=amd64"
go build -ldflags="%flags%" -o .dist/%name%.win64.exe

set "GOOS=windows" & set "GOARCH=386"
go build -ldflags="%flags%" -o .dist/%name%.win32.exe

set "GOOS=linux" & set "GOARCH=amd64"
go build -ldflags="%flags%" -o .dist/%name%.linux

set "GOOS=darwin" & set "GOARCH=amd64"
go build -ldflags="%flags%" -o .dist/%name%.macos

set "GOOS=android" & set "GOARCH=arm64"
go build -ldflags="%flags%" -o .dist/%name%.android

echo  * Built completed.

if "%~1"=="-upx" (
    echo  * Upx compressing...
    cd .dist
    upx --lzma --best %name%.*
    echo  * Upx compressing completed.
)

popd
