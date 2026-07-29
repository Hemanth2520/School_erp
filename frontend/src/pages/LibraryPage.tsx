import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../components/ui/DataTable';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { Library, BookOpen, AlertCircle, Users, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiList, useApiCreate, useApiUpdate, useApiDelete } from '../hooks/useApi';
import { Modal } from '../components/ui/Modal';
import { useForm } from 'react-hook-form';

type Book = {
  _id?: string;
  id?: string;
  customId?: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  year: number;
  copies: number;
  available: number;
  status: string;
};

type BookFormInputs = {
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  year: number;
  copies: number;
  available?: number;
  status?: string;
};

export function LibraryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { data: books = [], isLoading: loadingBooks, error } = useApiList<Book>('books');
  const { data: bookIssues = [] } = useApiList<any>('book-issues');

  const createBook = useApiCreate();
  const updateBook = useApiUpdate();
  const deleteBook = useApiDelete();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BookFormInputs>({
    defaultValues: {
      category: 'Mathematics',
      year: 2024,
      copies: 10,
    },
  });

  const handleOpenAddModal = () => {
    setEditingBook(null);
    reset({
      isbn: '',
      title: '',
      author: '',
      category: 'Mathematics',
      publisher: 'Khanna Publishers',
      year: 2024,
      copies: 10,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setValue('isbn', book.isbn || '');
    setValue('title', book.title || '');
    setValue('author', book.author || '');
    setValue('category', book.category || 'Mathematics');
    setValue('publisher', book.publisher || '');
    setValue('year', book.year || 2024);
    setValue('copies', book.copies || 1);
    setValue('available', book.available ?? book.copies ?? 1);
    setValue('status', book.status || 'Available');
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (book: Book) => {
    const id = book.customId || book._id || book.id;
    if (!id) return;

    if (window.confirm(`Are you sure you want to delete book "${book.title}"?`)) {
      try {
        await deleteBook.mutateAsync({ path: 'books', id });
        toast.success(`Book removed from catalog.`);
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Failed to delete book');
      }
    }
  };

  const onSubmit = async (data: BookFormInputs) => {
    try {
      const totalCopies = Number(data.copies) || 1;
      const availableCopies = editingBook ? Number(data.available ?? totalCopies) : totalCopies;

      const payload = {
        ...data,
        year: Number(data.year),
        copies: totalCopies,
        available: availableCopies,
        status: data.status || (availableCopies > 0 ? 'Available' : 'Out of Stock'),
      };

      if (editingBook) {
        const id = editingBook.customId || editingBook._id || editingBook.id;
        await updateBook.mutateAsync({
          path: 'books',
          id: id!,
          data: payload,
        });
        toast.success(`Book "${data.title}" updated!`);
      } else {
        await createBook.mutateAsync({
          path: 'books',
          data: payload,
        });
        toast.success(`Book "${data.title}" added to catalog!`);
      }

      reset();
      setIsModalOpen(false);
      setEditingBook(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save book');
    }
  };

  const columns: ColumnDef<Book>[] = [
    {
      accessorKey: 'isbn',
      header: 'ISBN / Barcode',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('isbn') || row.original.customId || '—'}</span>,
    },
    {
      accessorKey: 'title',
      header: 'Book Title & Author',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{row.getValue('title')}</p>
            <p className="text-xs text-muted-foreground">{row.original.author}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'publisher', header: 'Publisher' },
    { accessorKey: 'year', header: 'Year' },
    {
      accessorKey: 'copies',
      header: 'Copies Available',
      cell: ({ row }) => (
        <div className="text-sm font-semibold">
          <span>{row.original.available ?? row.getValue('copies')}</span>
          <span className="text-muted-foreground text-xs font-normal">/{row.getValue('copies')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') || 'Available'} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            title="Edit Book"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteBook(row.original)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete Book"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const inputClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass = 'block text-xs font-medium text-foreground mb-1';

  return (
    <div className={loadingBooks ? 'opacity-50 transition-opacity space-y-6' : 'space-y-6'}>
      <PageHeader
        title="Library Catalog"
        description="Manage school library books, circulation, and member issues."
        showImport
        onAdd={handleOpenAddModal}
        addEnabled
        addLabel="Add Book"
      />

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Unable to load library catalog. Please retry.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-2">
        <StatCard title="Total Books" value={books.reduce((s, b) => s + (b.copies || 0), 0)} icon={Library} description="copies in library" />
        <StatCard title="Available" value={books.reduce((s, b) => s + (b.available || 0), 0)} icon={BookOpen} iconColor="text-green-500" description="ready to issue" />
        <StatCard title="Issued" value={bookIssues.filter((i: any) => i.status === 'Issued').length} icon={Users} iconColor="text-blue-500" description="currently issued" />
        <StatCard title="Overdue" value={bookIssues.filter((i: any) => i.status === 'Overdue').length} icon={AlertCircle} iconColor="text-red-500" description="past due date" />
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <DataTable columns={columns} data={books} searchKey="title" searchPlaceholder="Search by book title..." />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }}
        title={editingBook ? 'Edit Book Details' : 'Add New Book'}
        description={editingBook ? 'Modify book details, category, or copy availability.' : 'Enter book details to add to library inventory catalog.'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={labelClass}>Book Title *</label>
            <input {...register('title', { required: true })} className={inputClass} placeholder="e.g. Higher Engineering Mathematics" />
            {errors.title && <span className="text-xs text-red-500">Title is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Author *</label>
              <input {...register('author', { required: true })} className={inputClass} placeholder="e.g. B.S. Grewal" />
            </div>
            <div>
              <label className={labelClass}>ISBN / Barcode *</label>
              <input {...register('isbn', { required: true })} className={inputClass} placeholder="e.g. 978-8174091955" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category *</label>
              <select {...register('category', { required: true })} className={inputClass}>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Reference">Reference</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Publisher *</label>
              <input {...register('publisher', { required: true })} className={inputClass} placeholder="e.g. Khanna Publishers" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Publication Year *</label>
              <input type="number" {...register('year', { required: true })} className={inputClass} placeholder="e.g. 2022" />
            </div>
            <div>
              <label className={labelClass}>Total Copies *</label>
              <input type="number" {...register('copies', { required: true })} className={inputClass} placeholder="e.g. 10" />
            </div>
          </div>

          {editingBook && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Available Copies</label>
                <input type="number" {...register('available')} className={inputClass} placeholder="e.g. 8" />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select {...register('status')} className={inputClass}>
                  <option value="Available">Available</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBook(null);
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={createBook.isPending || updateBook.isPending}
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createBook.isPending || updateBook.isPending
                ? 'Saving…'
                : editingBook
                ? 'Update Book'
                : 'Add Book'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
