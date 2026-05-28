import React from 'react'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { Badge, Box, useTheme } from '@mui/material'
import Logo from '../assets/petstore-logo.svg'

type Props = {
  cartCount: number
  onOpenAdd: () => void
  onOpenCart?: () => void
  viewMode: 'customer' | 'admin'
  onViewModeChange: (mode: 'customer' | 'admin') => void
}

export default function NavBar({ cartCount, onOpenAdd, onOpenCart, viewMode, onViewModeChange }: Props) {
  const theme = useTheme()
  return (
  <Box component="header" className="site-header header-flat-bg text-stone-100" sx={{ borderBottom: 0 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <img src={Logo} alt="Petstore logo" className="h-10 w-10" />
              <div>
                <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.25rem' }}>HappyPaws</span>
                <div className="text-sm text-stone-200">A caring place for animals</div>
              </div>
            </div>
          </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-2">
                <button className={`header-btn ${viewMode === 'customer' ? 'active' : ''}`} onClick={() => onViewModeChange('customer')}>Customer</button>
                <button className={`header-btn ${viewMode === 'admin' ? 'active' : ''}`} onClick={() => onViewModeChange('admin')}>Admin</button>
              </div>
              {viewMode === 'admin' && (
                <button className="add-pet-btn plain-btn" onClick={onOpenAdd}>Add Pet</button>
              )}
              {viewMode === 'customer' && (
                <button className="cart-icon plain-btn" onClick={() => onOpenCart && onOpenCart()} aria-label="cart">
                  <Badge badgeContent={cartCount} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </button>
              )}
            </div>
        </div>
      </div>
    </Box>
  )
}
