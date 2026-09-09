$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$assetsDir = Join-Path $projectRoot 'assets'
New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null

Add-Type -AssemblyName System.Drawing

function New-RoundShieldIcon {
    param(
        [string]$FilePath,
        [int]$Size = 1024,
        [System.Drawing.Color]$BgColor = [System.Drawing.Color]::FromArgb(255,183,212,242),
        [System.Drawing.Color]$LightColor = [System.Drawing.Color]::FromArgb(255,255,255,255),
        [System.Drawing.Color]$BlueColor = [System.Drawing.Color]::FromArgb(255,118,170,224)
    )

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $outer = New-Object System.Drawing.SolidBrush($BgColor)
    $g.FillEllipse($outer, 0, 0, $Size, $Size)

    $inner = New-Object System.Drawing.SolidBrush($LightColor)
    $g.FillEllipse($inner, 150, 150, 724, 724)

    $blueBrush = New-Object System.Drawing.SolidBrush($BlueColor)
    $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
    $points = @(
        [System.Drawing.Point]::new(512, 220),
        [System.Drawing.Point]::new(720, 520),
        [System.Drawing.Point]::new(512, 840),
        [System.Drawing.Point]::new(304, 520)
    )
    $shape.AddPolygon($points)
    $g.FillPath($blueBrush, $shape)

    $whiteBrush = New-Object System.Drawing.SolidBrush($LightColor)
    $shield = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shield.AddEllipse(350, 350, 324, 324)
    $g.FillPath($whiteBrush, $shield)

    $highlight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90,255,255,255))
    $g.FillEllipse($highlight, 200, 180, 420, 220)

    $g.DrawEllipse((New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120,255,255,255), 10)), 30, 30, $Size - 60, $Size - 60)
    $g.Dispose()
    $bmp.Save($FilePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

New-RoundShieldIcon -FilePath (Join-Path $assetsDir 'icon.png')
New-RoundShieldIcon -FilePath (Join-Path $assetsDir 'splash.png')

Write-Output "Created: $assetsDir/icon.png and $assetsDir/splash.png"
