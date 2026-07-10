import React, { useState } from 'react';
import { X, Plus, HelpCircle } from 'lucide-react';

interface AddQuestionModalProps {
  currentUser: string;
  onClose: () => void;
  onQuestionAdded: () => void;
  darkMode: boolean;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  currentUser,
  onClose,
  onQuestionAdded,
  darkMode
}) => {
  const [title, setTitle] = useState(() => {
    try {
      const saved = localStorage.getItem('add_question_draft');
      if (saved) {
        const data = JSON.parse(saved);
        return data.title || '';
      }
    } catch (e) {}
    return '';
  });

  const [description, setDescription] = useState(() => {
    try {
      const saved = localStorage.getItem('add_question_draft');
      if (saved) {
        const data = JSON.parse(saved);
        return data.description || '';
      }
    } catch (e) {}
    return '';
  });

  const [difficulty, setDifficulty] = useState(() => {
    try {
      const saved = localStorage.getItem('add_question_draft');
      if (saved) {
        const data = JSON.parse(saved);
        return data.difficulty || 'Medium';
      }
    } catch (e) {}
    return 'Medium';
  });

  const [topic, setTopic] = useState(() => {
    try {
      const saved = localStorage.getItem('add_question_draft');
      if (saved) {
        const data = JSON.parse(saved);
        return data.topic || 'Algorithms';
      }
    } catch (e) {}
    return 'Algorithms';
  });

  const [tags, setTags] = useState(() => {
    try {
      const saved = localStorage.getItem('add_question_draft');
      if (saved) {
        const data = JSON.parse(saved);
        return data.tags || 'Python,Array';
      }
    } catch (e) {}
    return 'Python,Array';
  });

  const [expectedTime, setExpectedTime] = useState(() => {
    try {
      const saved = localStorage.getItem('add_question_draft');
      if (saved) {
        const data = JSON.parse(saved);
        return data.expectedTime || '30 mins';
      }
    } catch (e) {}
    return '30 mins';
  });

  const [referenceLinks, setReferenceLinks] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const draft = { title, description, difficulty, topic, tags, expectedTime };
    localStorage.setItem('add_question_draft', JSON.stringify(draft));
  }, [title, description, difficulty, topic, tags, expectedTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setErrorMessage(null);

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          topic,
          tags,
          created_by: currentUser,
          expected_time: expectedTime,
          reference_links: referenceLinks
        })
      });

      if (res.ok) {
        localStorage.removeItem('add_question_draft');
        onQuestionAdded();
        onClose();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to add question');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error');
    }
  };

  const cardBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl rounded-3xl border p-6 shadow-2xl space-y-6 ${cardBg}`}>
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Add New Python Interview Question</h3>
              <p className="text-xs text-slate-400">Added to <code className="text-indigo-400">questions.csv</code> automatically.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Question Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Valid Anagram in Python with Counter"
              className={`w-full p-3 rounded-xl text-xs border outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className={`w-full p-3 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Topic / Category</label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className={`w-full p-3 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Strings">Strings</option>
                <option value="Lists">Lists</option>
                <option value="Dictionaries">Dictionaries</option>
                <option value="Recursion">Recursion</option>
                <option value="OOP">OOP</option>
                <option value="Generators">Generators</option>
                <option value="Decorators">Decorators</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Pandas">Pandas / NumPy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed description of the problem, constraints, and examples..."
              className={`w-full p-3 rounded-xl text-xs border outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Python,Hash Table,Sorting"
                className={`w-full p-3 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Expected Time</label>
              <input
                type="text"
                value={expectedTime}
                onChange={e => setExpectedTime(e.target.value)}
                placeholder="30 mins"
                className={`w-full p-3 rounded-xl text-xs border outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 text-xs shadow-md transition"
            >
              <Plus className="h-4 w-4" />
              <span>Create Question</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
