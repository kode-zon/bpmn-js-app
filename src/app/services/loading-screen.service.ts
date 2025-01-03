import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root'
})
export class LoadingScreenService {
  private numberOfShowingSprinner = 0;
  private spinnerTop;

  constructor(
    private overlay: Overlay,
  ) { 
    this.spinnerTop = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'loading-screen-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });
  }

  public showSpinner() {
    console.debug("showSpinner");
    if (this.numberOfShowingSprinner === 0) {
      this.spinnerTop.attach(new ComponentPortal(MatSpinner));
    }

    this.numberOfShowingSprinner++;
  }

  public stopSpinner(all?:boolean) {
    console.debug("stopSpinner");
    if(this.numberOfShowingSprinner > 0) {
      this.numberOfShowingSprinner--;
    }
    if(all) {
      this.numberOfShowingSprinner = 0;
    }
    if(this.numberOfShowingSprinner === 0){
      this.spinnerTop.detach();
    }
  }
}
