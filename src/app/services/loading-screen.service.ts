import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root'
})
export class LoadingScreenService {
  private numberOfShowingSprinner = 0;
  private spinnerTop = this.overlay.create({
    hasBackdrop: true,
    backdropClass: 'loading-screen-backdrop',
    positionStrategy: this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically()
  });

  constructor(
    private overlay: Overlay,
  ) { }

  public showSpinner() {
    if (this.numberOfShowingSprinner === 0) {
      this.spinnerTop.attach(new ComponentPortal(MatSpinner));
    }

    this.numberOfShowingSprinner++;
  }

  public stopSpinner() {
    this.numberOfShowingSprinner--;
    if(this.numberOfShowingSprinner === 0){
      this.spinnerTop.detach();
    }
  }
}
