import { Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Homepage from './pages/Homepage'
const App = () => {
  return (
   <>
   <Navbar />
   <Routes>
    <Route path="/homepage" element={<Homepage />} />
   </Routes>
   </>
  )
}

export default App