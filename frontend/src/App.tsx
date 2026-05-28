import React, { useEffect, useState } from 'react'
import axios from 'axios'
import NavBar from './components/NavBar'
import ProductGrid from './components/ProductGrid'
import AddPetModal from './components/AddPetModal'
import CartDrawer from './components/CartDrawer'
import SearchFilterBar from './components/SearchFilterBar'
import { Snackbar, Alert } from '@mui/material'
import { Box, Container, Typography } from '@mui/material'
import AdminPetTable from './components/AdminPetTable'
import CustomerFooter from './components/CustomerFooter'
import Logo from './assets/petstore-logo.svg'

export type Pet = { id?: number; name: string; species: string; price: number; imageUrl?: string }

export default function App() {
  const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  type CartItem = { pet: Pet; quantity: number }
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [snackOpen, setSnackOpen] = useState(false)
  const [errorSnack, setErrorSnack] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [updateSnack, setUpdateSnack] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer')
  const [query, setQuery] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API_BASE}/api/pets`)
        setPets(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreate = async (pet: Pet) => {
    try {
      const res = await axios.post(`${API_BASE}/api/pets`, pet)
      setPets((p) => [...p, res.data])
      return
    } catch (err: any) {
      console.error(err)
      const data = err?.response?.data
      if (data && data.errors) return { errors: data.errors }
      return
    }
  }

  const handleAddToCart = (pet: Pet) => {
    setCartItems((prev) => {
      const found = prev.find((it) => it.pet.id === pet.id)
      if (found) return prev.map((it) => it.pet.id === pet.id ? { ...it, quantity: it.quantity + 1 } : it)
      return [...prev, { pet, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    const previous = pets
    setPets((p) => p.filter((x) => x.id !== id))
    try {
      await axios.delete(`${API_BASE}/api/pets/${id}`)
    } catch (e) {
      setPets(previous)
      setErrorSnack('Delete failed')
    }
  }

  const handleCheckout = () => { setCartItems([]); setCartOpen(false); setSnackOpen(true) }

  const handleRemoveItem = (petId?: number) => {
    if (!petId) return
    setCartItems((prev) => {
      const found = prev.find((it) => it.pet.id === petId)
      if (!found) return prev
      if (found.quantity > 1) return prev.map((it) => it.pet.id === petId ? { ...it, quantity: it.quantity - 1 } : it)
      return prev.filter((it) => it.pet.id !== petId)
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar cartCount={cartItems.reduce((s, it) => s + it.quantity, 0)} onOpenAdd={() => setAddOpen(true)} onOpenCart={() => setCartOpen(true)} viewMode={viewMode} onViewModeChange={setViewMode} />

      {viewMode === 'customer' && (
        <section className="hero-wrap">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="hero-panel relative overflow-visible rounded-2xl shadow-2xl grid gap-8 lg:grid-cols-2 items-center">
              <div className="hero-blob" aria-hidden />
              <div className="p-10 lg:pl-16 lg:pr-8">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-sm"><img src={Logo} alt="HappyPaws" className="h-8 w-8" /><span className="text-sm font-semibold text-stone-800">HappyPaws</span></div>
                <Typography variant="h1" component="h1" className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">Find your perfect companion today</Typography>
                <p className="mt-4 text-lg text-stone-700 max-w-xl">Adopt locally, shop ethically — discover pets and the care they need.</p>
                <div className="mt-6 flex flex-wrap items-center gap-4"><a className="hero-cta" href="#">Adopt Now</a><a className="hero-cta-outline" href="#">Learn More</a></div>
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="text-center"><div className="text-2xl font-bold">10,000+</div><div className="text-sm text-stone-600">Pets adopted</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">120+</div><div className="text-sm text-stone-600">Shelters partnered</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">5,000+</div><div className="text-sm text-stone-600">Pet lovers</div></div>
                </div>
              </div>
              <div className="relative p-6 lg:p-0 flex justify-end">
                <div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=1200&q=80" alt="Woman with dog" className="hero-image" loading="lazy" /></div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="flex-1">
        <Box className="page-container" sx={{ py: 3 }}>
          <Container maxWidth="lg">
            {viewMode === 'customer' ? (
              <>
                <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }} className="mt-0 mb-8">Shop Pets</Typography>
                <div className="mb-6"><SearchFilterBar query={query} onQueryChange={setQuery} species={speciesFilter} onSpeciesChange={setSpeciesFilter} speciesOptions={[...Array.from(new Set(pets.map((p) => p.species).filter(Boolean)))]} /></div>
                {loading ? <div>Loading...</div> : <div className="pt-4"><ProductGrid pets={pets.filter(p => (query === '' || p.name.toLowerCase().includes(query.toLowerCase())) && (speciesFilter === '' || p.species === speciesFilter))} onAddToCart={handleAddToCart} onDelete={handleDelete} showAdminActions={false} /></div>}
              </>
            ) : (
              <>
                <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }} className="mt-12 mb-8">Manage Pets</Typography>
                {loading ? <div>Loading...</div> : <AdminPetTable pets={pets} onDelete={handleDelete} />}
              </>
            )}
          </Container>
        </Box>
      </main>

      <AddPetModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
      {viewMode === 'customer' && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onCheckout={handleCheckout} onRemoveItem={handleRemoveItem} />}

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}><Alert severity="success" sx={{ width: '100%' }}>Checkout successful — thank you for your purchase!</Alert></Snackbar>
      <Snackbar open={!!updateSnack} autoHideDuration={2500} onClose={() => setUpdateSnack(null)}><Alert severity="success" sx={{ width: '100%' }}>{updateSnack}</Alert></Snackbar>
      <Snackbar open={!!errorSnack} autoHideDuration={6000} onClose={() => setErrorSnack(null)}><Alert severity="error" sx={{ width: '100%' }}>{errorSnack}</Alert></Snackbar>

      <CustomerFooter />
    </div>
  )
}
import ProductGrid from './components/ProductGrid'
import AddPetModal from './components/AddPetModal'
import CartDrawer from './components/CartDrawer'
import SearchFilterBar from './components/SearchFilterBar'
import { Snackbar, Alert } from '@mui/material'
import { Box, Container, Typography } from '@mui/material'
import AdminPetTable from './components/AdminPetTable'
import CustomerFooter from './components/CustomerFooter'
import Logo from './assets/petstore-logo.svg'

export type Pet = { id?: number; name: string; species: string; price: number; imageUrl?: string }

export default function App() {
  const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  type CartItem = { pet: Pet; quantity: number }
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [snackOpen, setSnackOpen] = useState(false)
  const [errorSnack, setErrorSnack] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [updateSnack, setUpdateSnack] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer')
  const [query, setQuery] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API_BASE}/api/pets`)
        setPets(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreate = async (pet: Pet) => {
    try {
      const res = await axios.post(`${API_BASE}/api/pets`, pet)
      setPets((p) => [...p, res.data])
      return
    } catch (err: any) {
      console.error(err)
      const data = err?.response?.data
      if (data && data.errors) return { errors: data.errors }
      return
    }
  }

  const handleAddToCart = (pet: Pet) => {
    setCartItems((prev) => {
      const found = prev.find((it) => it.pet.id === pet.id)
      if (found) return prev.map((it) => it.pet.id === pet.id ? { ...it, quantity: it.quantity + 1 } : it)
      return [...prev, { pet, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    const previous = pets
    setPets((p) => p.filter((x) => x.id !== id))
    try {
      await axios.delete(`${API_BASE}/api/pets/${id}`)
    } catch (e) {
      setPets(previous)
      setErrorSnack('Delete failed')
    }
  }

  const handleCheckout = () => { setCartItems([]); setCartOpen(false); setSnackOpen(true) }

  const handleRemoveItem = (petId?: number) => {
    if (!petId) return
    setCartItems((prev) => {
      const found = prev.find((it) => it.pet.id === petId)
      if (!found) return prev
      if (found.quantity > 1) return prev.map((it) => it.pet.id === petId ? { ...it, quantity: it.quantity - 1 } : it)
      return prev.filter((it) => it.pet.id !== petId)
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar cartCount={cartItems.reduce((s, it) => s + it.quantity, 0)} onOpenAdd={() => setAddOpen(true)} onOpenCart={() => setCartOpen(true)} viewMode={viewMode} onViewModeChange={setViewMode} />

      {viewMode === 'customer' && (
        <section className="hero-wrap">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="hero-panel relative overflow-visible rounded-2xl shadow-2xl grid gap-8 lg:grid-cols-2 items-center">
              <div className="hero-blob" aria-hidden />
              <div className="p-10 lg:pl-16 lg:pr-8">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-sm"><img src={Logo} alt="HappyPaws" className="h-8 w-8" /><span className="text-sm font-semibold text-stone-800">HappyPaws</span></div>
                <Typography variant="h1" component="h1" className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">Find your perfect companion today</Typography>
                <p className="mt-4 text-lg text-stone-700 max-w-xl">Adopt locally, shop ethically — discover pets and the care they need.</p>
                <div className="mt-6 flex flex-wrap items-center gap-4"><a className="hero-cta" href="#">Adopt Now</a><a className="hero-cta-outline" href="#">Learn More</a></div>
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="text-center"><div className="text-2xl font-bold">10,000+</div><div className="text-sm text-stone-600">Pets adopted</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">120+</div><div className="text-sm text-stone-600">Shelters partnered</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">5,000+</div><div className="text-sm text-stone-600">Pet lovers</div></div>
                </div>
              </div>
              <div className="relative p-6 lg:p-0 flex justify-end">
                <div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=1200&q=80" alt="Woman with dog" className="hero-image" loading="lazy" /></div>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="flex-1">
        <Box className="page-container" sx={{ py: 3 }}>
          <Container maxWidth="lg">
            {viewMode === 'customer' ? (
              <>
                <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }} className="mt-0 mb-8">Shop Pets</Typography>
                <div className="mb-6"><SearchFilterBar query={query} onQueryChange={setQuery} species={speciesFilter} onSpeciesChange={setSpeciesFilter} speciesOptions={[...Array.from(new Set(pets.map((p) => p.species).filter(Boolean)))]} /></div>
                {loading ? <div>Loading...</div> : <div className="pt-4"><ProductGrid pets={pets.filter(p => (query === '' || p.name.toLowerCase().includes(query.toLowerCase())) && (speciesFilter === '' || p.species === speciesFilter))} onAddToCart={handleAddToCart} onDelete={handleDelete} showAdminActions={false} /></div>}
              </>
            ) : (
              <>
                <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }} className="mt-12 mb-8">Manage Pets</Typography>
                {loading ? <div>Loading...</div> : <AdminPetTable pets={pets} onDelete={handleDelete} />}
              </>
            )}
          </Container>
        </Box>
      </main>

      <AddPetModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
      {viewMode === 'customer' && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onCheckout={handleCheckout} onRemoveItem={handleRemoveItem} />}

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}><Alert severity="success" sx={{ width: '100%' }}>Checkout successful — thank you for your purchase!</Alert></Snackbar>
      <Snackbar open={!!updateSnack} autoHideDuration={2500} onClose={() => setUpdateSnack(null)}><Alert severity="success" sx={{ width: '100%' }}>{updateSnack}</Alert></Snackbar>
      <Snackbar open={!!errorSnack} autoHideDuration={6000} onClose={() => setErrorSnack(null)}><Alert severity="error" sx={{ width: '100%' }}>{errorSnack}</Alert></Snackbar>

      <CustomerFooter />
    </div>
  )
}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">5,000+</div>
                    <div className="text-sm text-stone-600">Pet lovers</div>
                  </div>
                </div>
              </div>

              <div className="relative p-6 lg:p-0 flex justify-end">
                <div className="hero-image-wrap">
                  <img src="https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=1200&q=80" alt="Woman with dog" className="hero-image" loading="lazy" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      const data = err?.response?.data
      if (data && data.errors) {
        return { errors: data.errors }
      }
      return
    }
  }

  const handleAddToCart = (pet: Pet) => {
    setCartItems((prev) => {
      const found = prev.find((it) => it.pet.id === pet.id)
      if (found) return prev.map((it) => it.pet.id === pet.id ? { ...it, quantity: it.quantity + 1 } : it)
      return [...prev, { pet, quantity: 1 }]
    })
    import React, { useEffect, useState } from 'react'
    import axios from 'axios'
    import NavBar from './components/NavBar'
    import ProductGrid from './components/ProductGrid'
    import AddPetModal from './components/AddPetModal'
    import CartDrawer from './components/CartDrawer'
    import SearchFilterBar from './components/SearchFilterBar'
    import { Snackbar, Alert } from '@mui/material'
    import { Box, Container, Typography } from '@mui/material'
    import AdminPetTable from './components/AdminPetTable'
    import CustomerFooter from './components/CustomerFooter'
    import Logo from './assets/petstore-logo.svg'

    export type Pet = {
      id?: number
      name: string
      species: string
      price: number
      imageUrl?: string
    }

    export default function App() {
      const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
      const [pets, setPets] = useState<Pet[]>([])
      const [loading, setLoading] = useState(false)
      type CartItem = { pet: Pet; quantity: number }
      const [cartItems, setCartItems] = useState<CartItem[]>([])
      const [cartOpen, setCartOpen] = useState(false)
      const [snackOpen, setSnackOpen] = useState(false)
      const [errorSnack, setErrorSnack] = useState<string | null>(null)
      const [addOpen, setAddOpen] = useState(false)
      const [updateSnack, setUpdateSnack] = useState<string | null>(null)
      const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer')
      // search + filter state
      const [query, setQuery] = useState('')
      const [speciesFilter, setSpeciesFilter] = useState('')

      const load = async () => {
        setLoading(true)
        try {
          const res = await axios.get(`${API_BASE}/api/pets`)
          setPets(res.data)
        } catch (e) { console.error(e) }
        setLoading(false)
      }

      useEffect(() => { load() }, [])

      useEffect(() => {
        const handler = async (e: any) => {
          const updated: Pet = e.detail
          if (!updated?.id) return
          try {
            const res = await axios.put(`${API_BASE}/api/pets/${updated.id}`, updated)
            setPets((prev) => prev.map((p) => p.id === res.data.id ? res.data : p))
            setUpdateSnack('Pet updated')
            setTimeout(() => setUpdateSnack(null), 2500)
          } catch (err: any) {
            console.error('Failed to update pet', err)
            const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error'
            setErrorSnack(`Update failed: ${errorMessage}`)
          }
        }
        window.addEventListener('pet-updated', handler as EventListener)
        return () => window.removeEventListener('pet-updated', handler as EventListener)
      }, [])

      const handleCreate = async (pet: Pet) => {
        try {
          const res = await axios.post(`${API_BASE}/api/pets`, pet)
          setPets((p) => [...p, res.data])
          return
        } catch (err: any) {
          console.error(err)
          const data = err?.response?.data
          if (data && data.errors) {
            return { errors: data.errors }
          }
          return
        }
      }

      const handleAddToCart = (pet: Pet) => {
        setCartItems((prev) => {
          const found = prev.find((it) => it.pet.id === pet.id)
          if (found) return prev.map((it) => it.pet.id === pet.id ? { ...it, quantity: it.quantity + 1 } : it)
          return [...prev, { pet, quantity: 1 }]
        })
        setCartOpen(true)
      }

      const handleDelete = async (id?: number) => {
        if (!id) return
        // optimistic remove
        const previous = pets
        setPets((p) => p.filter((x) => x.id !== id))
        console.log('Attempting to delete pet', id)
        try {
          await axios.delete(`${API_BASE}/api/pets/${id}`)
        } catch (error: any) {
          console.error('Full error details:', error)
          const errorMessage = error?.response?.data?.message || error?.response?.data || error?.message || 'Unknown server error'
          setErrorSnack(`Delete failed: ${errorMessage}`)
          // revert on failure
          setPets(previous)
        }
      }

      const handleCheckout = () => {
        setCartItems([])
        setCartOpen(false)
        setSnackOpen(true)
      }

      const handleRemoveItem = (petId?: number) => {
        if (!petId) return
        setCartItems((prev) => {
          const found = prev.find((it) => it.pet.id === petId)
          if (!found) return prev
          if (found.quantity > 1) {
            return prev.map((it) => it.pet.id === petId ? { ...it, quantity: it.quantity - 1 } : it)
          }
          return prev.filter((it) => it.pet.id !== petId)
        })
      }

      return (
        <div className="min-h-screen flex flex-col">
          <NavBar
            cartCount={cartItems.reduce((s, it) => s + it.quantity, 0)}
            onOpenAdd={() => setAddOpen(true)}
            onOpenCart={() => setCartOpen(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {viewMode === 'customer' && (
            <section className="hero-wrap">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="hero-panel relative overflow-visible rounded-2xl shadow-2xl grid gap-8 lg:grid-cols-2 items-center">
                  {/* decorative blob/background */}
                  <div className="hero-blob" aria-hidden />

                  <div className="p-10 lg:pl-16 lg:pr-8">
                    <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-sm">
                      <img src={Logo} alt="HappyPaws" className="h-8 w-8" />
                      <span className="text-sm font-semibold text-stone-800">HappyPaws</span>
                    </div>

                    <Typography variant="h1" component="h1" className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                      Find your perfect companion today
                    </Typography>
                    <p className="mt-4 text-lg text-stone-700 max-w-xl">Adopt locally, shop ethically — discover pets and the care they need. Healthy, vetted pets and responsible care — all in one place.</p>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <a className="hero-cta" href="#">Adopt Now</a>
                      <a className="hero-cta-outline" href="#">Learn More</a>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">10,000+</div>
                        <div className="text-sm text-stone-600">Pets adopted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">120+</div>
                        <div className="text-sm text-stone-600">Shelters partnered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">5,000+</div>
                        <div className="text-sm text-stone-600">Pet lovers</div>
                      </div>
                    </div>
                  </div>

                  <div className="relative p-6 lg:p-0 flex justify-end">
                    <div className="hero-image-wrap">
                      <img src="https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=1200&q=80" alt="Woman with dog" className="hero-image" loading="lazy" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <main className="flex-1">
            <Box className="page-container" sx={{ py: 3 }}>
              <Container maxWidth="lg">
                {viewMode === 'customer' && (
                  <>
                    <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }} className="mt-0 mb-8">Shop Pets</Typography>
                    <div className="mb-6">
                      <SearchFilterBar
                        query={query}
                        onQueryChange={setQuery}
                        species={speciesFilter}
                        onSpeciesChange={setSpeciesFilter}
                        speciesOptions={[...Array.from(new Set(pets.map((p) => p.species).filter(Boolean)))]}
                      />
                    </div>
                    {loading ? <div>Loading...</div> : (
                      <>
                        {(() => {
                          const filtered = pets.filter((p) => {
                            const matchesQuery = query.trim() === '' || p.name.toLowerCase().includes(query.toLowerCase())
                            const matchesSpecies = speciesFilter === '' || p.species === speciesFilter
                            return matchesQuery && matchesSpecies
                          })
                          return <div className="pt-4"><ProductGrid pets={filtered} onAddToCart={handleAddToCart} onDelete={handleDelete} showAdminActions={false} /></div>
                        })()}
                      </>
                    )}
                  </>
                )}

                {viewMode === 'admin' && (
                  <>
                    <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }} className="mt-12 mb-8">Manage Pets</Typography>
                    {loading ? <div>Loading...</div> : (
                      <AdminPetTable pets={pets} onDelete={handleDelete} />
                    )}
                  </>
                )}
              </Container>
            </Box>
          </main>
          <AddPetModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
          {viewMode === 'customer' && (
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onCheckout={handleCheckout} onRemoveItem={handleRemoveItem} />
          )}
          <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
            <Alert severity="success" sx={{ width: '100%' }}>Checkout successful — thank you for your purchase!</Alert>
          </Snackbar>
          <Snackbar open={!!updateSnack} autoHideDuration={2500} onClose={() => setUpdateSnack(null)}>
            <Alert severity="success" sx={{ width: '100%' }}>{updateSnack}</Alert>
          </Snackbar>
          <Snackbar open={!!errorSnack} autoHideDuration={6000} onClose={() => setErrorSnack(null)}>
            <Alert severity="error" sx={{ width: '100%' }}>{errorSnack}</Alert>
          </Snackbar>
          <CustomerFooter />
        </div>
      )
    }
                    {loading ? <div>Loading...</div> : (
                      <>
                        {(() => {
                          const filtered = pets.filter((p) => {
                            const matchesQuery = query.trim() === '' || p.name.toLowerCase().includes(query.toLowerCase())
                            const matchesSpecies = speciesFilter === '' || p.species === speciesFilter
                            return matchesQuery && matchesSpecies
                          })
                          return <div className="pt-4"><ProductGrid pets={filtered} onAddToCart={handleAddToCart} onDelete={handleDelete} showAdminActions={false} /></div>
                        })()}
                      </>
                    )}
                  </>
                )}

                {viewMode === 'admin' && (
                  <>
                    <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 700 }} className="mt-12 mb-8">Manage Pets</Typography>
                    {loading ? <div>Loading...</div> : (
                      <AdminPetTable pets={pets} onDelete={handleDelete} />
                    )}
                  </>
                )}
              </Container>
            </Box>
          </main>
          <AddPetModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} />
          {viewMode === 'customer' && (
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} onCheckout={handleCheckout} onRemoveItem={handleRemoveItem} />
          )}
          <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
            <Alert severity="success" sx={{ width: '100%' }}>Checkout successful — thank you for your purchase!</Alert>
          </Snackbar>
          <Snackbar open={!!updateSnack} autoHideDuration={2500} onClose={() => setUpdateSnack(null)}>
            <Alert severity="success" sx={{ width: '100%' }}>{updateSnack}</Alert>
          </Snackbar>
          <Snackbar open={!!errorSnack} autoHideDuration={6000} onClose={() => setErrorSnack(null)}>
            <Alert severity="error" sx={{ width: '100%' }}>{errorSnack}</Alert>
          </Snackbar>
          <CustomerFooter />
        </div>
      )
    }
