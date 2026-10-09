import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Repuesto } from 'src/app/core/models/repuesto.model';
import { Categoria } from 'src/app/core/models/categoria.model';
import { RepuestoService } from 'src/app/core/services/repuesto.service';
import { CategoriaService } from 'src/app/core/services/categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-repuestos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './repuestos.component.html',
  styleUrls: ['./repuestos.component.css']
})
export class RepuestosComponent implements OnInit {
  repuestos: Repuesto[] = [];
  repuestosFiltrados: Repuesto[] = [];
  categorias: Categoria[] = [];

  terminoBusqueda: string = '';
  cargando: boolean = false;

  repuestoForm!: FormGroup;
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
    private repuestoService: RepuestoService,
    private categoriaService: CategoriaService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.cargarCategorias();
    this.cargarRepuestos();
  }

  initForm(): void {
    this.repuestoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(30)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      id_categoria: [null],
      stock_actual: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.required, Validators.min(0)]],
      precio_unitario: [0.00, [Validators.required, Validators.min(0)]]
    });
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: () => console.error('Error al cargar categorías para el selector.')
    });
  }

  cargarRepuestos(): void {
    this.cargando = true;
    this.repuestoService.getRepuestos().subscribe({
      next: (data) => {
        this.repuestos = data;
        this.repuestosFiltrados = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudieron cargar los repuestos desde el servidor.',
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
      this.repuestosFiltrados = [...this.repuestos];
    } else {
      this.repuestosFiltrados = this.repuestos.filter(item =>
        item.nombre.toLowerCase().includes(termino) ||
        item.codigo.toLowerCase().includes(termino) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(termino))
      );
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.idSeleccionado = null;
    this.repuestoForm.reset({
      stock_actual: 0,
      stock_minimo: 0,
      precio_unitario: 0.00,
      id_categoria: null
    });
    this.mostrarModal = true;
  }

  abrirModalEditar(repuesto: Repuesto): void {
    this.modoEdicion = true;
    this.idSeleccionado = repuesto.id_repuesto || null;
    this.repuestoForm.patchValue({
      codigo: repuesto.codigo,
      nombre: repuesto.nombre,
      descripcion: repuesto.descripcion,
      id_categoria: repuesto.id_categoria,
      stock_actual: repuesto.stock_actual,
      stock_minimo: repuesto.stock_minimo,
      precio_unitario: repuesto.precio_unitario
    });
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (this.repuestoForm.invalid) {
      this.repuestoForm.markAllAsTouched();
      this.Toast.fire({
        icon: 'warning',
        title: 'Completá los campos obligatorios'
      });
      return;
    }

    const data: Repuesto = this.repuestoForm.value;

    if (this.modoEdicion && this.idSeleccionado) {
      this.repuestoService.actualizarRepuesto(this.idSeleccionado, data).subscribe({
        next: () => {
          this.cargarRepuestos();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Repuesto actualizado correctamente'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: err.error?.mensaje || 'No se pudo actualizar el repuesto.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    } else {
      this.repuestoService.crearRepuesto(data).subscribe({
        next: () => {
          this.cargarRepuestos();
          this.cerrarModal();
          this.Toast.fire({
            icon: 'success',
            title: 'Repuesto registrado con éxito'
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: err.error?.mensaje || 'No se pudo registrar el repuesto.',
            background: '#1e293b',
            color: '#f8fafc',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }

  obtenerNombreCategoria(idCat?: number): string {
    if (!idCat) return 'Sin categoría';
    const cat = this.categorias.find(c => c.id_categoria === idCat);
    return cat ? cat.nombre : 'Sin categoría';
  }
}