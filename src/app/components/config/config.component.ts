import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-config',
  standalone: false,
  
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent {

  repoConfigs:RepoConfig[] = []

  @Output() event = new EventEmitter<string>();


  constructor() {
  }

  addItem() {
    this.repoConfigs.push({ authType: "Bearer" ,hideSecrets: true })
  }

  emitActionEvent(name:string) {
    this.event.emit(name);
  }

  
}

export type RepoConfig = {
  domain?: string,
  repoType?: "GitLab"|"CORS"
  authType?: "None"|"Bearer"|"Basic"|"GitLabPrivate",
  token?: string,
  user?: string,
  pass?: string,
  hideSecrets: boolean
}
