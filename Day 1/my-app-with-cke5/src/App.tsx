import './App.css'
import { ClassicEditor, Essentials, Italic, Paragraph, Bold } from 'ckeditor5'
import { CKEditor } from '@ckeditor/ckeditor5-react'

function App() {
  return (
  <>
  <CKEditor
     editor = { ClassicEditor }
    config = {
      {
        licenseKey: import.meta.env.VITE_CKEDITOR_LICENSE_KEY,
        plugins: [
          Essentials,
          Paragraph,
          Bold,
          Italic,
        ],
        toolbar: [
          'undo',
          'redo',
          '|',
          'bold',
          'italic',
          '|',
        ],
        root: {
          initialData: '<p>Hello from CKEditor 5 in React!</p>'
        }   
      }
    }
  />
  </>)
}

export default App
