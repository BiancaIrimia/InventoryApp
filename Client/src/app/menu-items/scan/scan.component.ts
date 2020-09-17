import { Component, OnInit } from '@angular/core';
import { BarcodeFormat } from '@zxing/library'
import { Router } from '@angular/router';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.css']
})
export class ScanComponent implements OnInit {

 torchEnabled = false;
 tryHarder = false;
 currentDevice : MediaDeviceInfo = null;
 formats = [BarcodeFormat.QR_CODE];
 availableDevice: MediaDeviceInfo[];
 hasPermission: boolean;


  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onHasPermission(permission: boolean){
    this.hasPermission = permission;
  }

  onCamerasFound(devices : MediaDeviceInfo[]){
  this.availableDevice = devices;
  }

  onScanSuccess(data:string){
    console.log('data from qr:' +data );
    this.router.navigate(['/item/' + data]);
  }
}
