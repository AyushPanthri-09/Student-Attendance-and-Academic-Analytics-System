param(
    [switch]$SkipClean,
    [int]$ServerPort = 8080
)

$ErrorActionPreference = 'Stop'

$projectDir = $PSScriptRoot
Set-Location $projectDir

$defaultJavaHome = 'C:\Users\sriva\.jdks\ms-17.0.17'
$javaHome = if ($env:JAVA17_HOME) { $env:JAVA17_HOME } else { $defaultJavaHome }

if (-not (Test-Path $javaHome)) {
    throw "JDK 17 path not found: $javaHome. Set JAVA17_HOME to your JDK 17 installation."
}

$env:JAVA_HOME = $javaHome
$env:Path = "$($env:JAVA_HOME)\bin;$env:Path"

$mvnCandidates = @(
    'C:\Users\sriva\.maven\maven-3.9.14(2)\bin\mvn.cmd',
    'mvn'
)

$mvnCmd = $null
foreach ($candidate in $mvnCandidates) {
    if ($candidate -eq 'mvn') {
        $found = Get-Command mvn -ErrorAction SilentlyContinue
        if ($found) {
            $mvnCmd = 'mvn'
            break
        }
    } elseif (Test-Path $candidate) {
        $mvnCmd = $candidate
        break
    }
}

if (-not $mvnCmd) {
    throw 'Maven not found. Install Maven or update run-backend.ps1 with the correct mvn.cmd path.'
}

Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
& java -version

# Fast safeguard: clear stale class files that may be compiled with a different JDK.
if (-not $SkipClean) {
    & $mvnCmd clean -DskipTests
    if ($LASTEXITCODE -ne 0) {
        throw "Maven clean failed with exit code $LASTEXITCODE"
    }
}

& $mvnCmd spring-boot:run -DskipTests "-Dspring-boot.run.arguments=--server.port=$ServerPort"
if ($LASTEXITCODE -ne 0) {
    throw "Backend failed to start (exit code $LASTEXITCODE)."
}
