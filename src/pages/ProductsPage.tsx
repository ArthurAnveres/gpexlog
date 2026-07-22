import { useState, type FormEvent } from 'react'
import { useApp } from '../context/AppContext'
import { formatUsd } from '../data/mock'

export function ProductsPage() {
  const { products, addProduct } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [price, setPrice] = useState('')
  const [weightLb, setWeightLb] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    addProduct({
      name,
      sku,
      price: Number(price),
      weightLb: Number(weightLb),
      category,
      description: description || undefined,
    })
    setName('')
    setSku('')
    setPrice('')
    setWeightLb('')
    setCategory('General')
    setDescription('')
    setOpen(false)
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p>
            Catalog of items you sell or stock (name, price, weight). Shipments
            are created separately by selecting a product.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          Add product
        </button>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Weight</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{formatUsd(product.price)}</td>
                  <td>{product.weightLb.toFixed(1)} lb</td>
                  <td>{product.description ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSubmit}
          >
            <div className="modal-body">
              <h2 style={{ fontSize: '1.35rem' }}>Add product</h2>
              <p style={{ color: 'var(--muted)' }}>
                Example: Batman action figure — price, weight, SKU.
              </p>
              <div className="form-grid two" style={{ marginTop: '0.5rem' }}>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="name">Product name</label>
                  <input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Batman action figure"
                  />
                </div>
                <div className="field">
                  <label htmlFor="sku">SKU</label>
                  <input
                    id="sku"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="TOY-BAT-001"
                  />
                </div>
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <input
                    id="category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="price">Price (USD)</label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="29.99"
                  />
                </div>
                <div className="field">
                  <label htmlFor="weight">Weight (lb)</label>
                  <input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={weightLb}
                    onChange={(e) => setWeightLb(e.target.value)}
                    placeholder="1.2"
                  />
                </div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional details"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save product
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
