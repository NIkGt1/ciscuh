param(
    [int]$Port = 4173
)

$ErrorActionPreference = "Stop"
$root = [System.IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$address = [System.Net.IPAddress]::Loopback
$listener = [System.Net.Sockets.TcpListener]::new($address, $Port)
$listener.Start()

function Get-ContentType([string]$path) {
    switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".svg"  { return "image/svg+xml" }
        ".woff2" { return "font/woff2" }
        ".pkt"  { return "application/octet-stream" }
        ".md"   { return "text/markdown; charset=utf-8" }
        default { return "application/octet-stream" }
    }
}

function Write-Response($stream, [int]$status, [string]$statusText, [string]$contentType, [byte[]]$body, [bool]$headOnly, [string]$extraHeaders = "") {
    $header = "HTTP/1.1 $status $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n$extraHeaders`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    if (-not $headOnly) {
        $stream.Write($body, 0, $body.Length)
    }
    $stream.Flush()
}

Write-Host ""
Write-Host "  NETWURK/04" -ForegroundColor Green
Write-Host "  Serving $root"
Write-Host "  http://localhost:$Port" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop."
Write-Host ""

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 4096, $true)

            $requestLine = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }

            while ($true) {
                $line = $reader.ReadLine()
                if ([string]::IsNullOrEmpty($line)) { break }
            }

            $parts = $requestLine.Split(" ")
            $method = $parts[0]
            $rawPath = $parts[1].Split("?")[0]
            $headOnly = $method -eq "HEAD"
            if ($method -ne "GET" -and -not $headOnly) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Method not allowed")
                Write-Response $stream 405 "Method Not Allowed" "text/plain" $body $false
                continue
            }

            $decodedPath = [System.Uri]::UnescapeDataString($rawPath)
            if ($decodedPath -eq "/") { $decodedPath = "/index.html" }

            $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $decodedPath.TrimStart("/")))
            if (-not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
                Write-Response $stream 403 "Forbidden" "text/plain" $body $false
                continue
            }

            if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
                $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
                Write-Response $stream 404 "Not Found" "text/plain" $body $false
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $extra = ""
            if ([System.IO.Path]::GetExtension($filePath) -eq ".pkt") {
                $extra = "Content-Disposition: attachment; filename=`"4 NETWURK.pkt`"`r`n"
            }
            Write-Response $stream 200 "OK" (Get-ContentType $filePath) $bytes $headOnly $extra
        }
        catch {
            # A client can disappear mid-response; keep the server alive.
        }
        finally {
            if ($client) { $client.Close() }
        }
    }
}
finally {
    $listener.Stop()
}
