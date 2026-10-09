import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Mecanico } from 'src/app/core/models/mecanico.model';
import { Usuario } from 'src/app/core/models/usuario.model';
import { MecanicoService } from 'src/app/core/services/mecanico.service';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mecanicos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './mecanicos.component.html',
  styleUrls: ['./mecanicos.component.css']
})
export class MecanicosComponent implements OnInit {
  mecanicos: Mecanico[] = [];
  mecanicosFiltrados: Mecanico[] = [];
  usuarios: Usuario[] = [];
  usuariosDisponibles: Usuario[] = [];

  terminoBusqueda: string = '';
  cargando: boolean = false;

  mecanicoForm!: FormGroup;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  idSeleccionado: number | null = null;

  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1e293b',
    color: '#f8fafc'
  });

  constructor(
    private mecanicoService: MecanicoService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarMecanicos();
    this.cargarUsuarios();
  }

  initForm(): void {
    this.mecanicoForm = this.fb.group({
      id_usuario: [null, [Validators.required]],
      especialidad: ['', [Validators.maxLength(100)]],
      activo: [true]
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filtrarUsuariosDisponibles();
      },
      error: () => console.error('Error al cargar usuarios desde la API')
    });
  }

  cargarMecanicos(): void {
    this.cargando = true;
    this.mecanicoService.getMecanicos().subscribe({
      next: (data) => {
        this.mecanicos = data;
        this.mecanicosFiltrados = data;
        this.cargando = false;
        this.filtrarUsuariosDisponibles();
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar los mecánicos.',
          background: '#1e293b',
          color: '#f8fafc',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  filtrarUsuariosDisponibles(): void {
    if (!this.usuarios.length) return;
    const idsMecanicosActivos = this.mecanicos
      .filter(m => m.activo && m.id_usuario !== undefined)
      .map(m => m.id_usuario);
    this.usuariosDisponibles = this.usuarios.filter(u =>
      u.activo && u.id_usuario !== undefined && !idsMecanicosActivos.includes(u.id_usuario)
    );
  }

  filtrar(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.mecanicosFiltrados = [...this.mecanicos];
    } else {
      this.mecanicosFiltrados = this.mecanicos.filter(item => {
        const nombreCompleto = this.obtenerNombreUsuario(item.id_usuario).toLowerCase();
        return (
          nombreCompleto.includes(termino) ||
          (item.especialidad && item.especialidad.toLowerCase().includes(termino)) ||
          (item.id_usuario !== undefined && item.id_usuario.toString().includes(termino))
        );
      });
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.filtrarUsuariosDisponibles();
    this.mecanicoForm.reset({
      activo: true,
      id_usuario: null,
      especialidad: ''
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(mecanico: Mecanico): void {
    this.modoEdicion = true;
    this.idSeleccionado = mecanico.id_mecanico || null;
    this.mecanicoForm.patchValue({
      id_usuario: mecanico.id_usuario,
      especialidad: mecanico.especialidad,
      activo: mecanico.activo
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.mecanicoForm.invalid) {
      this.mecanicoForm.markAllAsTouched();
      this.Toast.fire({
        icon: 'warning',
        title: 'Por favor, seleccioná un usuario de la lista'
      });
      return;
    }

    const data: Mecanico = this.mecanicoForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.mecanicoService.actualizarMecanico(this.idSeleccionado, data).subscribe({
        next: () => {
          this.cargarMecanicos();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Mecánico actualizado correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar la información.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.mecanicoService.crearMecanico(data).subscribe({
        next: () => {
          this.cargarMecanicos();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Mecánico registrado con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo registrar el mecánico.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }

  desactivar(id?: number): void {
    if (!id) return;

    Swal.fire({
      title: '¿Desactivar mecánico?',
      text: 'El mecánico cambiará su estado a inactivo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      background: '#1e293b',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mecanicoService.desactivarMecanico(id).subscribe({
          next: () => {
            this.cargarMecanicos();
            this.Toast.fire({
              icon: 'success',
              title: 'Mecánico desactivado'
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error?.mensaje || 'No se pudo desactivar el mecánico.',
              background: '#1e293b',
              color: '#f8fafc',
              confirmButtonColor: '#2563eb'
            });
          }
        });
      }
    });
  }

  obtenerNombreUsuario(idUsuario: number): string {
    const u = this.usuarios.find(user => user.id_usuario === idUsuario);
    return u ? `${u.nombre} ${u.apellido}` : `Usuario #${idUsuario}`;
  }

  obtenerEmailUsuario(idUsuario: number): string {
    const u = this.usuarios.find(user => user.id_usuario === idUsuario);
    return u ? u.email : '';
  }
}