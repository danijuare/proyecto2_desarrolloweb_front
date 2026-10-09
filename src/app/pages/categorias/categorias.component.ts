import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Categoria } from 'src/app/core/models/categoria.model';
import { CategoriaService } from 'src/app/core/services/categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  
  terminoBusqueda: string = '';
  cargando: boolean = false;
  errorMensaje: string = '';

  categoriaForm!: FormGroup;
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
    color: '#f8fafc',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  constructor(
    private categoriaService: CategoriaService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarCategorias();
  }

  initForm(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  cargarCategorias(): void {
    this.cargando = true;
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
        this.categoriasFiltradas = data;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar las categorías desde el servidor.',
          background: '#1e293b',
          color: '#f8fafc',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

  filtrar(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.categoriasFiltradas = [...this.categorias];
    } else {
      this.categoriasFiltradas = this.categorias.filter(cat => 
        cat.nombre.toLowerCase().includes(termino)
      );
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.categoriaForm.reset();
    this.mostrarModal = true;
  }

  abrirModalEditar(categoria: Categoria): void {
    this.modoEdicion = true;
    this.idSeleccionado = categoria.id_categoria || null;
    this.categoriaForm.patchValue({
      nombre: categoria.nombre
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      
      this.Toast.fire({
        icon: 'warning',
        title: 'Por favor, completá los campos requeridos'
      });
      return;
    }

    const categoriaData: Categoria = this.categoriaForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.categoriaService.actualizarCategoria(this.idSeleccionado, categoriaData).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Categoría actualizada correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar la categoría.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.categoriaService.crearCategoria(categoriaData).subscribe({
        next: () => {
          this.cargarCategorias();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Categoría registrada con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo crear la categoría.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }
}