import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import Overview from './pages/Overview'
import Items from './pages/Items'
import ItemPage from './pages/ItemPage'
import { NewItem, EditItem } from './pages/ItemFormPages'
import Timeline from './pages/Timeline'
import Places from './pages/Places'
import Backup from './pages/Backup'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="items" element={<Items />} />
        <Route path="items/new" element={<NewItem />} />
        <Route path="items/:id" element={<ItemPage />} />
        <Route path="items/:id/edit" element={<EditItem />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="places" element={<Places />} />
        <Route path="backup" element={<Backup />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
