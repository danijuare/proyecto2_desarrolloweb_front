import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  //variables
  loginForm!: FormGroup;
  cargando: boolean = false;
  errorMensaje: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.errorMensaje = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        console.log("this.loginForm.value", this.loginForm.value);
        this.cargando = false;
        // Redirigimos al dashboard tras un login exitoso
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        //console.log("error al ingresar ", err);
        this.cargando = false;
        if (err.status === 401) {
          this.errorMensaje = 'Credenciales incorrectas. Verificá tu correo y contraseña.';
        } else {
          this.errorMensaje = err.error?.mensaje || 'Error al conectar con el servidor.';
        }
      }
    });
  }

}
