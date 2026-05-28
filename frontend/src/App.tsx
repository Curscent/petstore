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
    // layout root that ensures footer is pushed to bottom
    <div className="min-h-screen flex flex-col">
      <NavBar
        cartCount={cartItems.reduce((s, it) => s + it.quantity, 0)}
        onOpenAdd={() => setAddOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'customer' && (
        <div className="hero-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 hero-animate-enter hero-animate-enter-active">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="text-center lg:text-left animate-[fadeUp_700ms_ease_forwards]">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2">
                  <img src={Logo} alt="Petstore logo" className="h-8 w-8" />
                  <span className="text-sm font-semibold text-stone-700">HappyPaws</span>
                </div>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{ color: 'secondary.main', fontWeight: 900 }}
                  className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mt-4 transition-transform duration-700 hover:-translate-y-1"
                >
                  Find your perfect companion today
                </Typography>
                <Typography variant="h3" sx={{ color: 'secondary.main', fontWeight: 700 }} className="mt-3 text-lg sm:text-xl">Healthy, vetted pets and responsible care — all in one place.</Typography>
                <Typography variant="body1" sx={{ color: 'secondary.main', opacity: 0.85 }} className="mt-4 text-stone-600 font-normal text-base sm:text-lg">
                  Adopt locally, shop ethically — discover pets and the care they need.
                </Typography>
                <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm lg:justify-start">
                  <span className="px-3 py-1 rounded-full bg-white/70 text-stone-700">Vet-checked</span>
                  <span className="px-3 py-1 rounded-full bg-white/70 text-stone-700">Same-day pickup</span>
                  <span className="px-3 py-1 rounded-full bg-white/70 text-stone-700">Care plans</span>
                  <span className="px-3 py-1 rounded-full bg-white/70 text-stone-700">New arrivals</span>
                </div>
                <div className="mt-6 max-w-2xl mx-auto lg:mx-0">
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold">Why HappyPaws?</h4>
                      <p className="text-sm text-stone-600 mt-2">We partner with local shelters and certified vets to ensure pets are healthy and ready for loving homes.</p>
                    </div>
                    <div className="bg-white/70 p-4 rounded-lg shadow-sm">
                      <h4 className="font-semibold">Care Plans & Support</h4>
                      <p className="text-sm text-stone-600 mt-2">Affordable starter kits, training guides, and 24/7 customer support to help your new pet settle in.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex flex-col gap-4 animate-[fadeUp_800ms_ease_forwards]">
                <div className="hero-visual">
                  <div className="hero-blob" aria-hidden />
                  <div className="hero-photo-card">
                    <img
                      src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80"
                      alt="Curious cat peeking"
                      className="hero-photo"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-sm font-semibold text-stone-700">Top match this week</p>
                    <p className="mt-1 text-base text-stone-600">Golden retriever pups with starter care kits.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <img
                      src="https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80"
                      alt="Golden puppy looking up"
                      className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="group overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <img
                      src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80"
                      alt="Rabbit sitting in grass"
                      className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                    {/* compute filtered pets */}
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
