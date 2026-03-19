export default function ModuleSelector({ selectedModule, onModuleChange }) {
  const modules = [
    {
      id: 'attendance',
      name: 'Attendance Analysis',
      description: 'Detect attendance patterns',
      icon: '📊'
    },
    {
      id: 'performance',
      name: 'Student Performance Risk',
      description: 'Detect students who may fail eligibility',
      icon: '📈'
    },
    {
      id: 'department',
      name: 'Department Analytics',
      description: 'Compare departments',
      icon: '🏫'
    },
    {
      id: 'subject',
      name: 'Course / Subject Analytics',
      description: 'Identify difficult subjects',
      icon: '📚'
    },
    {
      id: 'teacher',
      name: 'Teacher Analytics',
      description: 'Evaluate teaching engagement',
      icon: '👨‍🏫'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Analysis Modules</h2>
      <div className="grid grid-cols-5 gap-4">
        {modules.map(module => (
          <button
            key={module.id}
            onClick={() => onModuleChange(module.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedModule === module.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">{module.icon}</div>
            <h3 className="font-semibold text-sm">{module.name}</h3>
            <p className="text-xs text-gray-600 mt-1">{module.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}