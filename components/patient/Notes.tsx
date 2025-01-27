import { useState } from 'react';

interface Note {
  id: number;
  date: string;
  content: string;
  author: string;
}

interface NotesProps {
  patientId: string;
  notes: Note[];
}

export default function Notes({ patientId, notes }: NotesProps) {
  return (
    <div>
      {/* Notes Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-lg font-semibold">Notes</h3>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">
          + Add
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {new Date(note.date).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {note.author}
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{note.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
