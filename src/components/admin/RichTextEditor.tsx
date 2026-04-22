import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false, // Prevents weird padding issues when pasting from other sources
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align',
  'link', 'image'
];

export const RichTextEditor = React.forwardRef<ReactQuill, RichTextEditorProps>(({ value, onChange, placeholder }, ref) => {
  return (
    <div className="rich-text-editor">
      <ReactQuill 
        ref={ref}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
});

export default RichTextEditor;
