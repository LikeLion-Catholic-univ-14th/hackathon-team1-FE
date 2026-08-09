import { useState } from 'react'
import OnboardingStatusBar from './components/OnboardingStatusBar.jsx'
import './onboarding.css'

const sunscreenTypes = ['선크림', '선스틱', '선스프레이']
const blockingMethods = ['유기자차', '무기자차', '혼합자차']
const paGrades = ['PA+', 'PA++', 'PA+++', 'PA++++']

function DropdownField({
  id,
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}) {
  return (
    <div className="sunscreen-select-wrap">
      <label className="sunscreen-label" htmlFor={id}>
        {label}
      </label>
      <button
        className={`sunscreen-select${isOpen ? ' is-open' : ''}`}
        id={id}
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{value}</span>
        <span className="sunscreen-chevron" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="sunscreen-dropdown">
          {options.map((option) => (
            <button
              className={`sunscreen-dropdown__item${
                value === option ? ' is-selected' : ''
              }`}
              key={option}
              type="button"
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SunscreenSetup({ onBack, onComplete }) {
  const [openDropdown, setOpenDropdown] = useState('')
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    productName: '',
    type: '선크림',
    blockingMethod: '유기자차',
    spf: '50',
    pa: 'PA+',
  })

  const canAddProduct = Boolean(form.productName.trim())
  const canContinue = products.length > 0

  const updateForm = (field, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }))
  }

  const toggleDropdown = (name) => {
    setOpenDropdown((currentName) => (currentName === name ? '' : name))
  }

  const selectDropdownValue = (field, value) => {
    updateForm(field, value)
    setOpenDropdown('')
  }

  const handleAddProduct = () => {
    if (!canAddProduct) {
      return
    }

    setProducts((prevProducts) => [
      ...prevProducts,
      {
        id: crypto.randomUUID(),
        ...form,
        productName: form.productName.trim(),
      },
    ])
    setForm((prevForm) => ({
      ...prevForm,
      productName: '',
    }))
    setOpenDropdown('')
  }

  const handleContinue = () => {
    if (!canContinue) {
      return
    }

    onComplete?.(products)
  }

  return (
    <div className="onboarding-stage">
      <section className="onboarding-screen sunscreen-setup">
        <OnboardingStatusBar />

        <div className="sunscreen-setup__content">
          <button
            className="onboarding-back"
            type="button"
            aria-label="이전 화면으로 돌아가기"
            onClick={onBack}
          />

          <header className="sunscreen-setup__header">
            <h1 className="sunscreen-setup__title">
              지금 갖고 계신
              <br />
              자외선 차단제를 알려주세요!
            </h1>

            <div
              className="onboarding-progress sunscreen-setup__progress"
              aria-label="온보딩 진행 단계"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <span
                  className={`onboarding-progress__item${
                    index === 1 ? ' is-active' : ''
                  }`}
                  key={index}
                  aria-hidden="true"
                />
              ))}
            </div>
          </header>

          <form className="sunscreen-card">
            <input
              className={`sunscreen-product-input${
                form.productName ? ' has-value' : ''
              }`}
              type="text"
              value={form.productName}
              placeholder="제품명을 입력해주세요"
              onChange={(event) =>
                updateForm('productName', event.target.value)
              }
            />

            <div className="sunscreen-form-grid">
              <DropdownField
                id="sunscreen-type"
                label="종류"
                value={form.type}
                options={sunscreenTypes}
                isOpen={openDropdown === 'type'}
                onToggle={() => toggleDropdown('type')}
                onSelect={(value) => selectDropdownValue('type', value)}
              />

              <DropdownField
                id="sunscreen-method"
                label="차단 방식"
                value={form.blockingMethod}
                options={blockingMethods}
                isOpen={openDropdown === 'blockingMethod'}
                onToggle={() => toggleDropdown('blockingMethod')}
                onSelect={(value) =>
                  selectDropdownValue('blockingMethod', value)
                }
              />

              <div>
                <label className="sunscreen-label" htmlFor="sunscreen-spf">
                  SPF
                </label>
                <input
                  className="sunscreen-field"
                  id="sunscreen-spf"
                  inputMode="numeric"
                  type="text"
                  value={form.spf}
                  onChange={(event) => updateForm('spf', event.target.value)}
                />
              </div>

              <DropdownField
                id="sunscreen-pa"
                label="PA"
                value={form.pa}
                options={paGrades}
                isOpen={openDropdown === 'pa'}
                onToggle={() => toggleDropdown('pa')}
                onSelect={(value) => selectDropdownValue('pa', value)}
              />
            </div>

            <button
              className="sunscreen-add"
              type="button"
              disabled={!canAddProduct}
              onClick={handleAddProduct}
            >
              + 추가하기
            </button>

            {products.length > 0 && (
              <div className="sunscreen-products" aria-label="추가한 차단제">
                {products.map((product) => (
                  <div className="sunscreen-product-card" key={product.id}>
                    <div>
                      <strong>{product.productName}</strong>
                      <span>
                        {product.type} · {product.blockingMethod} · SPF{' '}
                        {product.spf} · {product.pa}
                      </span>
                    </div>
                    <button
                      type="button"
                      aria-label={`${product.productName} 삭제`}
                      onClick={() =>
                        setProducts((prevProducts) =>
                          prevProducts.filter((item) => item.id !== product.id),
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="sunscreen-actions">
              <button
                className="sunscreen-skip"
                type="button"
                onClick={() => onComplete?.([])}
              >
                건너뛰기
              </button>
              <button
                className="sunscreen-save"
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                저장하고 계속
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default SunscreenSetup
