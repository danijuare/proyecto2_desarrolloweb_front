import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { Permiso } from '../../core/models/permiso.model';
import { Role } from '../../core/models/role.model';
import { Usuario, UsuarioPermiso } from '../../core/models/usuario.model';
import { PermisoService } from '../../core/services/permiso.service';
import { RoleService } from '../../core/services/role.service';
import { UsuarioPermisoService } from '../../core/services/usuario-permiso.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Role[] = [];
  permisos: Permiso[] = [];
  usuarioSeleccionado: Usuario | null = null;
  permisosDirectos: UsuarioPermiso[] = [];
  cargandoUsuarios = false;
  guardandoUsuario = false;
  guardandoPermiso = false;
  mostrarFormulario = false;
  usuarioForm: FormGroup;
  permisoForm: FormGroup;
  idEdicion: number | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private roleService: RoleService,
    private permisoService: PermisoService,
    private usuarioPermisoService: UsuarioPermisoService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.usuarioForm = this.fb.group({
      id_rol: [null, Validators.required],
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      apellido: ['', [Validators.required, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      password: ['']
    });
    this.permisoForm = this.fb.group({
      id_permiso: [null, Validators.required],
      tipo: ['conceder', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.roleService.getRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: (error) => this.mostrarError('No se pudieron cargar los roles.', error)
    });
    this.permisoService.getPermisos().subscribe({
      next: (permisos) => this.permisos = permisos.filter(permiso => permiso.condicion !== 0),
      error: (error) => this.mostrarError('No se pudieron cargar los permisos.', error)
    });
  }

  cargarUsuarios(): void {
    this.cargandoUsuarios = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargandoUsuarios = false;
        if (this.usuarioSeleccionado) {
          this.usuarioSeleccionado = usuarios.find(usuario =>
            usuario.id_usuario === this.usuarioSeleccionado?.id_usuario
          ) || null;
          if (!this.usuarioSeleccionado) {
            this.permisosDirectos = [];
          }
        }
      },
      error: (error) => {
        this.cargandoUsuarios = false;
        this.mostrarError('No se pudieron cargar los usuarios.', error);
      }
    });
  }

  seleccionarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.permisosDirectos = [];
    this.permisoForm.reset({ id_permiso: null, tipo: 'conceder' });
    this.usuarioPermisoService.getPermisos(usuario.id_usuario).subscribe({
      next: (respuesta) => this.permisosDirectos = respuesta.permisos_directos,
      error: (error) => this.mostrarError('No se pudieron cargar los permisos directos del usuario.', error)
    });
  }

  abrirCrear(): void {
    this.idEdicion = null;
    this.usuarioForm.reset({ id_rol: null, nombre: '', apellido: '', email: '', password: '' });
    this.usuarioForm.controls['password'].setValidators([Validators.required, Validators.minLength(8)]);
    this.usuarioForm.controls['password'].updateValueAndValidity();
    this.mostrarFormulario = true;
  }

  abrirEditar(usuario: Usuario, event: Event): void {
    event.stopPropagation();
    this.idEdicion = usuario.id_usuario;
    this.usuarioForm.reset({
      id_rol: usuario.id_rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      password: ''
    });
    this.usuarioForm.controls['password'].setValidators([Validators.minLength(8)]);
    this.usuarioForm.controls['password'].updateValueAndValidity();
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const form = this.usuarioForm.value;
    const datos = {
      id_rol: Number(form.id_rol),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      password: form.password || undefined
    };
    const guardado: Observable<unknown> = this.idEdicion === null
      ? this.usuarioService.crearUsuario({
        id_rol: datos.id_rol,
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        password: datos.password || ''
      })
      : this.usuarioService.actualizarUsuario(this.idEdicion, datos);

    this.guardandoUsuario = true;
    guardado.subscribe({
      next: () => {
        this.guardandoUsuario = false;
        this.mostrarFormulario = false;
        this.cargarUsuarios();
        Swal.fire({ icon: 'success', title: 'Usuario guardado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardandoUsuario = false;
        this.mostrarError('No se pudo guardar el usuario.', error);
      }
    });
  }

  async desactivarUsuario(usuario: Usuario, event: Event): Promise<void> {
    event.stopPropagation();
    if (usuario.id_usuario === this.authService.getUserId()) {
      await Swal.fire({ icon: 'warning', title: 'No puedes desactivar tu propia cuenta.' });
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: '¿Desactivar usuario?',
      text: `${usuario.nombre} ${usuario.apellido} ya no podrá iniciar sesión.`,
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) {
      return;
    }

    this.usuarioService.desactivarUsuario(usuario.id_usuario).subscribe({
      next: () => {
        if (this.usuarioSeleccionado?.id_usuario === usuario.id_usuario) {
          this.usuarioSeleccionado = null;
          this.permisosDirectos = [];
        }
        this.cargarUsuarios();
        Swal.fire({ icon: 'success', title: 'Usuario desactivado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => this.mostrarError('No se pudo desactivar el usuario.', error)
    });
  }

  guardarPermisoDirecto(): void {
    if (!this.usuarioSeleccionado || this.permisoForm.invalid) {
      this.permisoForm.markAllAsTouched();
      return;
    }

    const usuario = this.usuarioSeleccionado;
    this.guardandoPermiso = true;
    this.usuarioPermisoService.asignarPermiso(
      usuario.id_usuario,
      Number(this.permisoForm.value.id_permiso),
      this.permisoForm.value.tipo
    ).subscribe({
      next: () => {
        this.guardandoPermiso = false;
        this.seleccionarUsuario(usuario);
        Swal.fire({ icon: 'success', title: 'Permiso directo guardado', timer: 1800, showConfirmButton: false });
      },
      error: (error) => {
        this.guardandoPermiso = false;
        this.mostrarError('No se pudo guardar el permiso directo.', error);
      }
    });
  }

  async quitarPermiso(permiso: UsuarioPermiso): Promise<void> {
    if (!this.usuarioSeleccionado) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: 'question',
      title: '¿Quitar el permiso directo?',
      text: `${permiso.nombre} volverá a depender únicamente de los permisos del rol.`,
      showCancelButton: true,
      confirmButtonText: 'Quitar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmacion.isConfirmed) {
      return;
    }

    const usuario = this.usuarioSeleccionado;
    this.usuarioPermisoService.desasignarPermiso(usuario.id_usuario, permiso.id_permiso).subscribe({
      next: () => {
        this.seleccionarUsuario(usuario);
      },
      error: (error) => this.mostrarError('No se pudo quitar el permiso directo.', error)
    });
  }

  private mostrarError(mensaje: string, error: { error?: { mensaje?: string } }): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.error?.mensaje || mensaje
    });
  }
}
