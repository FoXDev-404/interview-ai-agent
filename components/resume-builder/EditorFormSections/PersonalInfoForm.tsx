'use client';

interface PersonalInfoFormProps {
  data: ResumePersonalInfo;
  onChange: (data: ResumePersonalInfo) => void;
}

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const update = (field: keyof ResumePersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Personal Information</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm text-light-400 mb-1">Full Name</label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Jane Smith"
            className="interview-input w-full"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-light-400 mb-1">Professional Title</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Senior Software Engineer"
            className="interview-input w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-light-400 mb-1">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="jane@email.com"
            className="interview-input w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-light-400 mb-1">Phone</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="interview-input w-full"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-light-400 mb-1">Location</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => update('location', e.target.value)}
            placeholder="San Francisco, CA"
            className="interview-input w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-light-400 mb-1">LinkedIn</label>
          <input
            type="text"
            value={data.linkedIn || ''}
            onChange={(e) => update('linkedIn', e.target.value)}
            placeholder="linkedin.com/in/janesmith"
            className="interview-input w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-light-400 mb-1">GitHub</label>
          <input
            type="text"
            value={data.github || ''}
            onChange={(e) => update('github', e.target.value)}
            placeholder="github.com/janesmith"
            className="interview-input w-full"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm text-light-400 mb-1">Portfolio Website</label>
          <input
            type="text"
            value={data.portfolio || ''}
            onChange={(e) => update('portfolio', e.target.value)}
            placeholder="janesmith.dev"
            className="interview-input w-full"
          />
        </div>
      </div>
    </div>
  );
}
