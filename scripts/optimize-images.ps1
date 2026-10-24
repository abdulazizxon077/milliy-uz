Add-Type -AssemblyName System.Drawing

$placesDir = Resolve-Path "web/public/images/places"
$files = Get-ChildItem -Path $placesDir -File

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]82)

$maxDimension = 1200

foreach ($file in $files) {
    if ($file.Length -gt 400KB -and ($file.Extension -eq ".jpg" -or $file.Extension -eq ".jpeg")) {
        try {
            $srcImg = [System.Drawing.Image]::FromFile($file.FullName)
            $w = $srcImg.Width
            $h = $srcImg.Height
            
            $ratio = 1.0
            if ($w -gt $maxDimension -or $h -gt $maxDimension) {
                if ($w -gt $h) {
                    $ratio = [double]$maxDimension / [double]$w
                } else {
                    $ratio = [double]$maxDimension / [double]$h
                }
            }
            
            $newW = [int]($w * $ratio)
            $newH = [int]($h * $ratio)
            
            $destBmp = New-Object System.Drawing.Bitmap($newW, $newH)
            $g = [System.Drawing.Graphics]::FromImage($destBmp)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            $g.DrawImage($srcImg, 0, 0, $newW, $newH)
            $g.Dispose()
            $srcImg.Dispose()
            
            $tempPath = $file.FullName + ".tmp"
            $destBmp.Save($tempPath, $jpegCodec, $encoderParams)
            $destBmp.Dispose()
            
            Remove-Item $file.FullName -Force
            Move-Item $tempPath $file.FullName -Force
            
            $newLen = (Get-Item $file.FullName).Length
            Write-Output ("Optimized: " + $file.Name + " (" + [math]::Round($file.Length/1024) + "KB -> " + [math]::Round($newLen/1024) + "KB)")
        } catch {
            Write-Error ("Error optimizing " + $file.Name + ": " + $_.Exception.Message)
        }
    }
}
Write-Output "Optimization completed."
