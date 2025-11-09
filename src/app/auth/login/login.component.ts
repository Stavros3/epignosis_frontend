import { Component, OnInit } from '@angular/core';
import { IonContent } from "@ionic/angular/standalone";
import { HeaderComponent } from "src/app/shared/components/header/header.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [HeaderComponent, IonContent]
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
