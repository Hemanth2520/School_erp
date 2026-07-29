import { useState, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '../components/ui/PageHeader';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, BookOpen, Users, ChevronRight } from 'lucide-react';
import { useApiCreate } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z.string().min(1, 'Date of birth required'),
  class: z.string().min(1, 'Class required'),
  section: z.string().min(1, 'Section required'),
  parentName: z.string().min(2, 'Parent name required'),
  parentPhone: z.string().regex(/^\d{10}$/, 'Enter valid 10-digit phone'),
  parentEmail: z.string().email('Valid email required'),
  address: z.string().min(5, 'Address required'),
  previousSchool: z.string().optional(),
  source: z.string().min(1, 'Source required'),
  bloodGroup: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const steps = ['Personal Info', 'Academic Info', 'Parent Info', 'Preview'];

export function AdmissionForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const createAdmission = useApiCreate();
  const { register, handleSubmit, trigger, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const formValues = watch();

  const stepFields: (keyof FormData)[][] = [
    ['firstName', 'lastName', 'gender', 'dob', 'address'],
    ['class', 'section', 'source'],
    ['parentName', 'parentPhone', 'parentEmail'],
    [],
  ];

  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(s => Math.min(s + 1, steps.length - 1));
    } else {
      toast.error('Please fill in all required fields in this section');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createAdmission.mutateAsync({ path: 'admissions', data: {
        name: `${data.firstName} ${data.lastName}`.trim(), class: data.class, section: data.section,
        gender: data.gender, dob: data.dob, parentName: data.parentName, phone: data.parentPhone,
        email: data.parentEmail, address: data.address, previousSchool: data.previousSchool, source: data.source,
        date: new Date().toISOString().split('T')[0], status: 'Pending',
      }});
      toast.success(`Admission submitted for ${data.firstName} ${data.lastName}!`);
      navigate('/admissions');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Unable to submit admission');
    }
  };

  const onError = () => {
    toast.error('Please fix errors in the form before submitting.');
    // Find first step with errors
    for (let i = 0; i < stepFields.length; i++) {
      const hasError = stepFields[i].some(field => errors[field]);
      if (hasError) {
        setCurrentStep(i);
        break;
      }
    }
  };

  const fieldClass = (error?: { message?: string }) =>
    `w-full rounded-lg border ${error ? 'border-red-400 focus:ring-red-400/30' : 'border-input focus:ring-primary/30'} bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all`;

  const labelClass = 'block text-xs font-medium text-foreground mb-1';
  const errorClass = 'mt-1 text-xs text-red-500';

  return (
    <div>
      <PageHeader title="New Admission" description="Fill in student details to create a new admission record." showExport={false} />

      {/* Steps */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((step, i) => (
          <Fragment key={step}>
            <button
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === i ? 'bg-primary/10 text-primary' : i < currentStep ? 'text-green-600' : 'text-muted-foreground'}`}
            >
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === i ? 'bg-primary text-white' : i < currentStep ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {i < currentStep ? '✓' : i + 1}
              </span>
              {step}
            </button>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
          </Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <div className="rounded-xl border border-border bg-card p-6 mb-6">
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><User className="h-4 w-4 text-primary" /></div>
                  <h2 className="text-base font-semibold">Personal Information</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input {...register('firstName')} className={fieldClass(errors.firstName)} placeholder="e.g. Aarav" />
                    {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input {...register('lastName')} className={fieldClass(errors.lastName)} placeholder="e.g. Sharma" />
                    {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select {...register('gender')} className={fieldClass(errors.gender)}>
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth *</label>
                    <input type="date" {...register('dob')} className={fieldClass(errors.dob)} />
                    {errors.dob && <p className={errorClass}>{errors.dob.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select {...register('bloodGroup')} className={fieldClass()}>
                      <option value="">Select blood group</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address *</label>
                    <textarea {...register('address')} className={`${fieldClass(errors.address)} resize-none`} rows={3} placeholder="Full residential address" />
                    {errors.address && <p className={errorClass}>{errors.address.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Academic Info */}
            {currentStep === 1 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="h-4 w-4 text-primary" /></div>
                  <h2 className="text-base font-semibold">Academic Information</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Class *</label>
                    <select {...register('class')} className={fieldClass(errors.class)}>
                      <option value="">Select class</option>
                      {['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'].map(c => <option key={c}>{c}</option>)}
                    </select>
                    {errors.class && <p className={errorClass}>{errors.class.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Section *</label>
                    <select {...register('section')} className={fieldClass(errors.section)}>
                      <option value="">Select section</option>
                      {['A','B','C','Science','Commerce','Arts'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    {errors.section && <p className={errorClass}>{errors.section.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Previous School</label>
                    <input {...register('previousSchool')} className={fieldClass()} placeholder="Name of previous school" />
                  </div>
                  <div>
                    <label className={labelClass}>Admission Source *</label>
                    <select {...register('source')} className={fieldClass(errors.source)}>
                      <option value="">Select source</option>
                      <option>Walk-in</option>
                      <option>Online</option>
                      <option>Agent</option>
                      <option>Referral</option>
                    </select>
                    {errors.source && <p className={errorClass}>{errors.source.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Parent Info */}
            {currentStep === 2 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
                  <h2 className="text-base font-semibold">Parent / Guardian Information</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Parent / Guardian Name *</label>
                    <input {...register('parentName')} className={fieldClass(errors.parentName)} placeholder="Full name" />
                    {errors.parentName && <p className={errorClass}>{errors.parentName.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input {...register('parentPhone')} className={fieldClass(errors.parentPhone)} placeholder="10-digit mobile number" />
                    {errors.parentPhone && <p className={errorClass}>{errors.parentPhone.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input {...register('parentEmail')} className={fieldClass(errors.parentEmail)} placeholder="email@example.com" />
                    {errors.parentEmail && <p className={errorClass}>{errors.parentEmail.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-base font-semibold mb-5">Review & Submit</h2>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  {[
                    { label: 'Name', value: `${formValues.firstName || '—'} ${formValues.lastName || ''}` },
                    { label: 'Gender', value: formValues.gender || '—' },
                    { label: 'Date of Birth', value: formValues.dob || '—' },
                    { label: 'Blood Group', value: formValues.bloodGroup || '—' },
                    { label: 'Class', value: formValues.class || '—' },
                    { label: 'Section', value: formValues.section || '—' },
                    { label: 'Previous School', value: formValues.previousSchool || '—' },
                    { label: 'Source', value: formValues.source || '—' },
                    { label: 'Parent Name', value: formValues.parentName || '—' },
                    { label: 'Parent Phone', value: formValues.parentPhone || '—' },
                    { label: 'Parent Email', value: formValues.parentEmail || '—' },
                    { label: 'Address', value: formValues.address || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-muted/50 px-4 py-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium mt-0.5 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button type="button" disabled={currentStep === 0} onClick={() => setCurrentStep(s => s - 1)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40 hover:bg-accent transition-colors">
            Previous
          </button>
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={handleNextStep} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Continue
            </button>
          ) : (
            <button disabled={createAdmission.isPending} type="submit" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {createAdmission.isPending ? 'Submitting…' : 'Submit Admission'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
