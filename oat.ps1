# ref https://source.android.com/docs/core/runtime/jit-compiler?hl=zh-cn
# ref https://www.cnblogs.com/ClientInfra/p/15379050.html

$packageName = Read-Host "Input PackageName"
$packageName = $packageName.Trim()

$debuggable = adb shell getprop ro.debuggable
$commandSU = ""
if ($debuggable -eq "1") {
    $commandSU = ""
    # $commandSU = "su -c"
}

function getOatPath($packageName) {

    $runtimePackageName = & adb shell $commandSU "ls /data/app/" | Select-String $packageName
    if (-not $runtimePackageName) {
        # adb shell pm path packageName -> package:/data/app/~~K1q-KAt6CSBAPEc2w6TXLQ==/com.mobirate.rcr2.gplay-kJZPvno6tzkKYEtNWwEimg==/base.apk
        # get ~~K1q-KAt6CSBAPEc2w6TXLQ==
        $runtimePackageName = & adb shell $commandSU "pm path $packageName"
    
        $pmPathOutput = adb shell $commandSU "pm path $packageName"
        $pattern = "package:(.*?)base.apk"
        $runtimePackageName = $pmPathOutput | Select-String -Pattern $pattern -AllMatches
    
        if ($runtimePackageName.Matches.Count -gt 0) {
            $packagePath = $runtimePackageName.Matches[0].Groups[1].Value + "oat"
            $lib_arch_path = adb shell $commandSU ls $packagePath
            $oatPath = $packagePath + "/" + $lib_arch_path
        }
        else {
            Write-Error "Package $packageName | Matches Fail"
            exit 1
        }
    }
    else {
        # libpath = "/data/data/" + packageName + "/lib"
        $packagePath = "/data/app/" + $runtimePackageName + "/oat"
        # adb shell $commandSU ls libpath
        $lib_arch_path = adb shell $commandSU ls $packagePath
        $oatPath = $packagePath + "/" + $lib_arch_path
    }
    return $oatPath
}

function printOATFiles($oatPath) {
    # get oat file
    $files = adb shell $commandSU ls $oatPath
    $files = $files -split "\r\n"
    $filesSize = @{}
    foreach ($file in $files) {
        $fileSize = adb shell $commandSU ls -l $oatPath/$file
        $fileSize = $fileSize -split "\r\n"
        $fileSize = $fileSize[0].Split(" ", [StringSplitOptions]::RemoveEmptyEntries)
        $filesSize.Add($file, $fileSize[4])
    }

    # Write-Host filename and filesize
    Write-Host "`nOAT Files" -ForegroundColor Cyan
    foreach ($file in $files) {
        Write-Host "$($file) : $($filesSize[$file]) B / $($filesSize[$file]/1024/1024) MB" -ForegroundColor Yellow
    }
}

$oatPath = getOatPath($packageName)

Write-Host "`nOAT Path : $oatPath" -ForegroundColor Green

printOATFiles($oatPath)

# adb shell setprop dalvik.vm.usejit
$JniStatus = adb shell getprop dalvik.vm.usejit
Write-Host "`ngetprop dalvik.vm.usejit => $JniStatus" -ForegroundColor Green

# dex2oat TIPS MEMU
# DISPLAY Current PackageName -> package
# 0. clear -> adb shell cmd package compile --reset package
# 1. compile interpret-only -> adb shell cmd package compile package -m interpret-only
# 2. compile space-profile -> adb shell cmd package compile package -m space-profile
# 3. compile space -> adb shell cmd package compile package -m space
# 4. compile speed-profile -> adb shell cmd package compile package -m speed-profile
# 5. compile speed -> adb shell cmd package compile package -m speed
# 6. compile everything -> adb shell cmd package compile package -m everything
# 7. clear all -> adb shell cmd package compile --reset -a
# 8. compile all -> adb shell cmd package compile -a
# 9. Quit

$option = -1
while ($option -ne 9) {
    Write-Host "`ndex2oat MENU OPTIONS" -ForegroundColor Cyan
    Write-Host "1. compile interpret-only" -ForegroundColor Yellow
    Write-Host "2. compile space-profile" -ForegroundColor Yellow -m
    Write-Host "3. compile space" -ForegroundColor Yellow
    Write-Host "4. compile speed-profile" -ForegroundColor Yellow
    Write-Host "5. compile speed" -ForegroundColor Yellow
    Write-Host "6. compile everything" -ForegroundColor Yellow
    Write-Host "7. clear" -ForegroundColor Yellow
    Write-Host "8. set dalvik.vm.usejit" -ForegroundColor Yellow
    Write-Host "9. pull oat files" -ForegroundColor Yellow
    Write-Host "0. quit" -ForegroundColor Yellow

    $option = Read-Host "Select an option"
    $option = $option.Trim()

    switch ($option) {
        "1" {
            Write-Host "execute -> cmd package compile -m interpret-only $packageName" -ForegroundColor Green
            $result = adb shell cmd package compile -m interpret-only $packageName
        }
        "2" {
            Write-Host "execute -> cmd package compile -m space-profile $packageName" -ForegroundColor Green
            $result = adb shell cmd package compile -m space-profile $packageName
        }
        "3" {
            Write-Host "execute -> cmd package compile -m space $packageName" -ForegroundColor Green
            $result = adb shell cmd package compile -m space $packageName
        }
        "4" {
            Write-Host "execute -> cmd package compile -m speed-profile $packageName" -ForegroundColor Green
            $result = adb shell cmd package compile -m speed-profile $packageName
        }
        "5" {
            Write-Host "execute -> cmd package compile -m speed $packageName" -ForegroundColor Green
            $result = adb shell cmd package compile -m speed $packageName
        }
        "6" {
            Write-Host "execute -> cmd package compile -m everything $packageName" -ForegroundColor Green
            $result = adb shell cmd package compile -m everything $packageName
        }
        "7" {
            Write-Host "execute -> cmd package compile --reset $packageName" -ForegroundColor Green
            # $result = adb shell cmd package compile --reset $packageName
            adb shell $commandSU rm -rf $oatPath
            return
        }
        "8" {
            # Set dalvik.vm.usejit to true or false
            $useJit = Read-Host "Set dalvik.vm.usejit (true/false)"
            $useJit = $useJit.Trim()
            adb shell setprop dalvik.vm.usejit $useJit
        }
        "9" {
            # pull oat files
            $oatPathLocal = Read-Host "Input host oat path"
            $oatFiles = adb shell $commandSU ls $oatPath
            $oatFiles = $oatFiles -split "\r\n"
            adb shell $commandSU chmod 777 $oatPath/*
            foreach ($oatFile in $oatFiles) {
                adb shell $commandSU cp $oatPath/$oatFile /data/local/tmp
                adb pull /data/local/tmp/$oatFile $oatPathLocal
                adb shell $commandSU rm -rf /data/local/tmp/$oatFile
            }
            $result = "Success"
        }
        "0" {
            return
        }
        default {
            Write-Host "Invalid option. Please select a valid option." -ForegroundColor Red
        }
    }

    if ($result -match "Success") {
        return $result
    }
    else {
        Write-Host "Fail" -ForegroundColor Red
    }
}

printOATFiles($oatPath)