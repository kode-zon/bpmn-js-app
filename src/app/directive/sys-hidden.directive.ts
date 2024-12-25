import { Directive, ElementRef, EmbeddedViewRef, OnInit, Optional, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';
import { AppService } from '../app.service';

@Directive({
  selector: '[sysHidden]',
  standalone: false
})
export class SysHiddenDirective implements OnInit {

  
  private originDisplayStyle: any = null;
  private embeddedView:EmbeddedViewRef<any>|null = null;

  constructor(
    public el: ElementRef, 
    public renderer: Renderer2,
    @Optional() private templateRef: TemplateRef<any>,
    @Optional() private viewContainer: ViewContainerRef,
    public appService: AppService) { 


      if(templateRef == null) {
        this.originDisplayStyle = getComputedStyle(this.el.nativeElement).display;
      }

      this.updateView()

  }

  ngOnInit() {
    this.appService.sysHiddenFlag.asObservable().subscribe(val => {
        this.updateView();
    });
  }

  private updateView() {

    try {

      if( this.appService.sysHiddenFlag.value == true) {
          if( this.templateRef != null) {
              if(this.embeddedView == null) {
                this.embeddedView = this.viewContainer.createEmbeddedView(this.templateRef);
              }
          } else {
            this.renderer.setStyle(
                        this.el.nativeElement, 
                        'display', 
                        this.originDisplayStyle);
          }
      } else {
        if( this.templateRef != null) {

            this.viewContainer.clear();
            this.embeddedView = null;
        } else {
          this.renderer.setStyle(
                      this.el.nativeElement, 
                      'display', 
                      'none');
        }
      }

      if(this.embeddedView != null) {
        this.embeddedView.rootNodes[0].setAttribute("sys-hidden-directive", '');
      }
    } catch(e) {
        console.log(e);
    }
  }

}
