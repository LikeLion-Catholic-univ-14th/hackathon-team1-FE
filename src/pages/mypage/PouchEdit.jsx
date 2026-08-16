import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import sunscreenIcon01 from '../../assets/sunscreen/sunscreen-icon-01.svg'
import sunscreenIcon02 from '../../assets/sunscreen/sunscreen-icon-02.svg'
import sunscreenIcon03 from '../../assets/sunscreen/sunscreen-icon-03.svg'
import sunscreenIcon04 from '../../assets/sunscreen/sunscreen-icon-04.svg'
import sunscreenIcon05 from '../../assets/sunscreen/sunscreen-icon-05.svg'
import sunscreenIcon06 from '../../assets/sunscreen/sunscreen-icon-06.svg'
import moreHorizontalIcon from '../../assets/icons/more-horizontal.svg'
import moreVerticalIcon from '../../assets/icons/more-vertical.svg'
import warningIcon from '../../assets/icons/warning.svg'
import StatusBar from '../../components/common/StatusBar.jsx'
import { saveOnboardingSunscreens } from '../onboarding/storage/onboardingProfileStorage.js'
import { deletePouchItem } from './api/mypageApi.js'
import {
  getFallbackMyPageData,
  loadMyPageData,
} from './utils/myPageData.js'

const sunscreenTypes = ['선크림', '선스틱', '선스프레이', '선파우더']
const blockingMethods = ['유기자차', '무기자차', '혼합자차']
const paGrades = ['PA+', 'PA++', 'PA+++', 'PA++++']
const maxSunscreenProductCount = 10
const sunscreenIcons = [
  sunscreenIcon01,
  sunscreenIcon02,
  sunscreenIcon03,
  sunscreenIcon04,
  sunscreenIcon05,
  sunscreenIcon06,
]
const emptyForm = {
  productName: '',
  type: '선크림',
  blockingMethod: '유기자차',
  spf: '50',
  pa: 'PA+',
}

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] text-left font-[SF_Pro] text-[#1D2B44] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"
const labelClass = `mb-2 ml-1 block text-[14px] font-[590] uppercase leading-[16.5px] text-[#8a9eb8] ${headingFontClass}`
const controlClass = `box-border flex h-[46px] w-full items-center justify-between rounded-[10px] border-[1.276px] bg-white px-[14px] text-left text-[13px] font-normal leading-[19.5px] tracking-[0] text-[#1d2b44] outline-none ${headingFontClass}`

function SunscreenActionSheet({ product, onClose, onEdit, onDelete }) {
  const dragStartYRef = useRef(0)
  const isDraggingRef = useRef(false)
  const [dragOffset, setDragOffset] = useState(0)

  if (!product) {
    return null
  }

  const startSheetDrag = (event) => {
    isDraggingRef.current = true
    dragStartYRef.current = event.clientY
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const moveSheetDrag = (event) => {
    if (!isDraggingRef.current) {
      return
    }

    setDragOffset(Math.max(0, event.clientY - dragStartYRef.current))
  }

  const endSheetDrag = (event) => {
    if (!isDraggingRef.current) {
      return
    }

    const finalOffset = Math.max(0, event.clientY - dragStartYRef.current)
    isDraggingRef.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (finalOffset > 44) {
      onClose()
      return
    }

    setDragOffset(0)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="box-border w-full max-w-[402px] rounded-t-[22px] bg-white px-[30px] pb-[62px] pt-[25px]"
        role="dialog"
        aria-modal="true"
        aria-label={`${product.productName} 관리`}
        onClick={(event) => event.stopPropagation()}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 160ms ease',
        }}
      >
        <span
          className="mx-auto mb-[29px] block h-[5px] w-[62px] cursor-grab touch-none rounded-full bg-[#e3e3e3] active:cursor-grabbing"
          aria-hidden="true"
          onPointerCancel={endSheetDrag}
          onPointerDown={startSheetDrag}
          onPointerMove={moveSheetDrag}
          onPointerUp={endSheetDrag}
        />
        <button
          className={`flex h-[53px] w-full items-center justify-center rounded-[14px] border-0 bg-[#1D2B44] text-[15px] font-bold leading-[23px] tracking-[-0.64px] text-white ${headingFontClass}`}
          type="button"
          onClick={onEdit}
        >
          수정하기
        </button>
        <button
          className={`mt-[14px] flex h-[53px] w-full items-center justify-center rounded-[14px] border-0 bg-[#E91B23] text-[15px] font-bold leading-[23px] tracking-[-0.64px] text-white ${headingFontClass}`}
          type="button"
          onClick={onDelete}
        >
          삭제하기
        </button>
      </div>
    </div>
  )
}

function ProductLimitNotice({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-[24px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="box-border flex w-full max-w-[336px] flex-col items-center rounded-[16px] bg-white px-[24px] py-[30px] shadow-[0_20px_60px_0_rgba(29,43,68,0.35)]"
        role="dialog"
        aria-modal="true"
        aria-label="제품 등록 개수 제한"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          className="h-[30px] w-[30px] object-contain"
          src={warningIcon}
          alt=""
          aria-hidden="true"
        />
        <p
          className={`m-0 mt-[22px] text-center text-[17px] font-bold leading-[24px] tracking-[-0.64px] text-[#1d2b44] ${headingFontClass}`}
        >
          제품은 10개까지 등록할 수 있어요
        </p>
      </div>
    </div>
  )
}

const stripSpfPa = (value) => String(value ?? '').replace(/\++$/, '')

const inferPa = (product) => {
  if (product.pa) {
    return product.pa
  }

  const pluses = String(product.spf ?? '').match(/\++$/)?.[0] ?? '+'

  return `PA${pluses}`
}

const normalizeProduct = (product, index) => ({
  id: product.id ?? `pouch-product-${index}`,
  productName: product.productName ?? product.name ?? '선크림',
  type: product.type ?? '선크림',
  blockingMethod: product.blockingMethod ?? product.method ?? '유기자차',
  spf: stripSpfPa(product.spf) || '50',
  pa: inferPa(product),
  icon: product.icon || sunscreenIcon01,
})

const normalizeProducts = (products) =>
  Array.isArray(products) ? products.map(normalizeProduct) : []

const getProductSnapshot = (product) =>
  JSON.stringify({
    productName: product.productName.trim(),
    type: product.type,
    blockingMethod: product.blockingMethod,
    spf: product.spf.trim(),
    pa: product.pa,
  })

function BackButton({ onClick }) {
  return (
    <button
      className="absolute left-[24px] flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0"
      type="button"
      aria-label="마이페이지로 돌아가기"
      onClick={onClick}
    >
      <span
        className="h-[10px] w-[10px] rotate-45 border-b-[2.4px] border-l-[2.4px] border-[#1d2b44]"
        aria-hidden="true"
      />
    </button>
  )
}

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
    <div className="relative">
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <button
        className={`${controlClass} ${
          isOpen ? 'border-[#f5a623]' : 'border-[#eceef2]'
        }`}
        id={id}
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span>{value}</span>
        <span
          className={`h-[10px] w-[10px] border-b-2 border-r-2 ${
            isOpen
              ? 'translate-y-[3px] rotate-[225deg] border-[#f5a623]'
              : '-translate-y-[3px] rotate-45 border-[#98a4b4]'
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-[#eceef2] bg-white shadow-[0_8px_24px_0_rgba(29,43,68,0.12)]">
          {options.map((option) => (
            <button
              className={`h-11 w-full border-0 border-b border-[#eceef2] px-4 text-left text-[14px] font-[590] leading-5 tracking-[-1px] last:border-b-0 ${headingFontClass} ${
                value === option
                  ? 'bg-[#FFFBF2] text-[#F5A623]'
                  : 'bg-white text-[#1d2b44]'
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

function ProductNameField({
  value,
  suggestions,
  onChange,
  onSelect,
  onFocus,
  onBlur,
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState('')
  const selectTimerRef = useRef(null)
  const query = value.trim().toLowerCase()
  const filteredSuggestions = query
    ? suggestions
        .filter((productName) => productName.toLowerCase().includes(query))
        .slice(0, 4)
    : []
  const shouldShowSuggestions = isFocused && filteredSuggestions.length > 0

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    window.setTimeout(() => setIsFocused(false), 120)
    onBlur?.()
  }

  return (
    <div className="relative">
      <input
        className={`box-border h-[48px] w-full rounded-[10px] border-[1.276px] bg-white px-4 font-[SF_Pro] text-[15px] font-normal leading-normal tracking-[-0.64px] text-[#1d2b44] outline-none placeholder:text-[rgba(29,43,68,0.5)] ${
          value ? 'border-[#f5a623]' : 'border-[#eceef2]'
        } ${shouldShowSuggestions ? 'rounded-b-none' : ''}`}
        type="text"
        value={value}
        placeholder="제품명을 입력해주세요"
        autoComplete="off"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(event) => {
          if (selectTimerRef.current) {
            window.clearTimeout(selectTimerRef.current)
          }
          setIsFocused(true)
          setSelectedSuggestion('')
          onChange(event.target.value)
        }}
      />

      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-[47px] z-30 overflow-hidden rounded-b-[10px] border-x-[1.276px] border-b-[1.276px] border-[#eceef2] bg-white shadow-[0_8px_18px_0_rgba(29,43,68,0.08)]">
          {filteredSuggestions.map((productName) => {
            const isSelected = selectedSuggestion === productName

            return (
              <button
                className={`block h-[48px] w-full border-0 border-b border-[#eceef2] px-4 text-left text-[14px] font-normal leading-[20px] tracking-[-0.64px] last:border-b-0 ${headingFontClass} ${
                  isSelected
                    ? 'bg-[#FFFBF2] text-[#F5A623]'
                    : 'bg-white text-[#1d2b44]'
                }`}
                key={productName}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (selectTimerRef.current) {
                    window.clearTimeout(selectTimerRef.current)
                  }
                  setSelectedSuggestion(productName)
                  selectTimerRef.current = window.setTimeout(() => {
                    onSelect(productName)
                    setIsFocused(false)
                  }, 1000)
                }}
              >
                {productName}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PouchProduct({ product, selected, onOpenActions }) {
  return (
    <li className="relative">
      <div
        className={`grid min-h-[68px] w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-[12px] rounded-[14px] border-[1.276px] px-[12px] py-[10px] text-left transition-colors ${
          selected
            ? 'border-[#f5a623] bg-[#fff9ed]'
            : 'border-[#ECEEF2] bg-[#F4F6F9]'
        }`}
      >
        <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px] bg-white shadow-[0_4px_14px_0_rgba(29,43,68,0.08)]">
          <img
            className="h-[20px] w-[20px] object-contain"
            src={product.icon}
            alt=""
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 pr-6">
          <strong
            className={`block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-[510] leading-[19.5px] tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
          >
            {product.productName}
          </strong>
          <div className="mt-[5px] flex flex-wrap gap-[2px]">
            {[
              product.type,
              product.blockingMethod,
              `SPF ${product.spf}`,
              product.pa,
            ].map((tag) => (
              <span
                className={`inline-flex min-h-[20px] items-center break-keep rounded-[99px] border-[1.276px] border-[#eceef2] bg-white px-[8px] py-[2px] text-center text-[11px] font-[510] leading-[16.5px] tracking-[-0.64px] text-[#3A506B] [overflow-wrap:anywhere] ${headingFontClass}`}
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        className="absolute right-[14px] top-[14px] flex h-[18px] w-[18px] items-center justify-center border-0 bg-transparent p-0"
        type="button"
        aria-label={`${product.productName} 수정 또는 삭제 메뉴 열기`}
        onClick={onOpenActions}
      >
        <img
          className="h-[15px] w-[3px] object-contain"
          src={moreVerticalIcon}
          alt=""
          aria-hidden="true"
        />
      </button>
    </li>
  )
}

function EmptyRegisteredSunscreenState() {
  return (
    <div className="mt-[12px] flex min-h-[243px] flex-col items-center justify-center gap-[8px] rounded-[22px] bg-white py-4 text-center shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <img
        className="h-[18px] w-[18px] object-contain opacity-70"
        src={moreHorizontalIcon}
        alt=""
        aria-hidden="true"
      />
      <p
        className={`m-0 text-[15px] font-normal leading-[21px] tracking-[-0.64px] text-[rgba(29,43,68,0.50)] ${headingFontClass}`}
      >
        아직 등록된 차단제가 없어요
      </p>
    </div>
  )
}

function PouchEdit() {
  const navigate = useNavigate()
  const formRef = useRef(null)
  const fallbackProducts = useMemo(
    () => normalizeProducts(getFallbackMyPageData().pouch),
    [],
  )
  const [products, setProducts] = useState(fallbackProducts)
  const [form, setForm] = useState(emptyForm)
  const [editingProductId, setEditingProductId] = useState('')
  const [actionProductId, setActionProductId] = useState('')
  const [openDropdown, setOpenDropdown] = useState('')
  const [focusedInput, setFocusedInput] = useState('')
  const [showLimitNotice, setShowLimitNotice] = useState(false)

  useEffect(() => {
    let ignore = false

    loadMyPageData().then((data) => {
      if (!ignore) {
        setProducts(normalizeProducts(data.pouch))
      }
    })

    return () => {
      ignore = true
    }
  }, [])

  const isEditing = Boolean(editingProductId)
  const editingProduct = products.find(
    (product) => product.id === editingProductId,
  )
  const actionProduct = products.find((product) => product.id === actionProductId)
  const hasFormChanges =
    !isEditing ||
    (editingProduct && getProductSnapshot(form) !== getProductSnapshot(editingProduct))
  const isProductFormValid = Boolean(
    form.productName.trim() &&
      form.type &&
      form.blockingMethod &&
      form.spf.trim() &&
      form.pa,
  )
  const canSubmitProduct = Boolean(isProductFormValid && hasFormChanges)

  const persistProducts = (nextProducts) => {
    setProducts(nextProducts)
    saveOnboardingSunscreens({ products: nextProducts })
  }

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

  const selectProductName = (productName) => {
    const product = findSunscreenProductByName(productName)

    if (!product) {
      updateForm('productName', productName)
      return
    }

    setForm((prevForm) => ({
      ...prevForm,
      productName: product.productName,
      type: product.type,
      blockingMethod: product.blockingMethod,
      spf: product.spf,
      pa: product.pa,
    }))
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product.id)
    setForm({
      productName: product.productName,
      type: product.type,
      blockingMethod: product.blockingMethod,
      spf: product.spf,
      pa: product.pa,
    })
    setActionProductId('')
    setOpenDropdown('')
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmitProduct = () => {
    if (!canSubmitProduct) {
      return
    }

    const nextProductValues = {
      ...form,
      productName: form.productName.trim(),
      spf: form.spf.trim(),
    }

    if (isEditing) {
      const nextProducts = products.map((product) =>
        product.id === editingProductId
          ? {
              ...product,
              ...nextProductValues,
            }
          : product,
      )

      persistProducts(nextProducts)
      setEditingProductId('')
      setForm(emptyForm)
      setOpenDropdown('')
      return
    }

    if (products.length >= maxSunscreenProductCount) {
      setShowLimitNotice(true)
      return
    }

    const randomIcon =
      sunscreenIcons[Math.floor(Math.random() * sunscreenIcons.length)]
    const nextProducts = [
      ...products,
      {
        id: crypto.randomUUID(),
        ...nextProductValues,
        icon: randomIcon,
      },
    ]

    persistProducts(nextProducts)
    setForm((prevForm) => ({
      ...prevForm,
      productName: '',
    }))
    setOpenDropdown('')
  }

  const handleRemoveProduct = (id) => {
    if (editingProductId === id) {
      setEditingProductId('')
      setForm(emptyForm)
    }

    persistProducts(products.filter((product) => product.id !== id))
    deletePouchItem(id).catch(() => {})
    setActionProductId('')
  }

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <StatusBar className="bg-transparent" />

        <header className="relative flex h-[60px] items-center justify-center bg-white">
          <BackButton onClick={() => navigate('/mypage')} />
          <h1
            className={`m-0 text-[17px] font-bold leading-6 tracking-[-0.4px] ${headingFontClass}`}
          >
            내 파우치
          </h1>
        </header>

        <main className="px-6 pb-10 pt-[32px]">
          <form
            className="box-border rounded-[22px] bg-white p-5 shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]"
            ref={formRef}
          >
            <div>
              <label
                className={labelClass}
                htmlFor="pouch-product-name"
              >
                제품명
              </label>
              <input
                className={`box-border h-[48px] w-full rounded-[10px] border-[1.276px] bg-white px-4 font-[SF_Pro] text-[15px] font-normal leading-normal tracking-[-0.64px] text-[#1d2b44] outline-none placeholder:text-[rgba(29,43,68,0.5)] focus:border-[#f5a623] ${
                  form.productName ? 'border-[#f5a623]' : 'border-[#eceef2]'
                }`}
                id="pouch-product-name"
                type="text"
                value={form.productName}
                placeholder="제품명을 입력해주세요"
                autoComplete="off"
                onFocus={() => {
                  setFocusedInput('productName')
                  setOpenDropdown('')
                }}
                onBlur={() => setFocusedInput('')}
                onChange={(event) => updateForm('productName', event.target.value)}
              />
            </div>

            <div className="mt-[18px] grid grid-cols-2 gap-x-[11px] gap-y-[18px]">
              <DropdownField
                id="pouch-type"
                label="종류"
                value={form.type}
                options={sunscreenTypes}
                isOpen={openDropdown === 'type'}
                onToggle={() => toggleDropdown('type')}
                onSelect={(value) => selectDropdownValue('type', value)}
              />
              <DropdownField
                id="pouch-method"
                label="차단 방식"
                value={form.blockingMethod}
                options={blockingMethods}
                isOpen={openDropdown === 'blockingMethod'}
                onToggle={() => toggleDropdown('blockingMethod')}
                onSelect={(value) =>
                  selectDropdownValue('blockingMethod', value)
                }
              />

              <label className="block">
                <span className={labelClass}>SPF</span>
                <input
                  className={`box-border h-[46px] w-full rounded-[10px] border-[1.276px] bg-white px-[14px] font-[SF_Pro] text-[13px] font-normal leading-[19.5px] tracking-[0] text-[#1d2b44] outline-none ${
                    focusedInput === 'spf'
                      ? 'border-[#f5a623]'
                      : 'border-[#eceef2]'
                  }`}
                  type="text"
                  inputMode="numeric"
                  value={form.spf}
                  onFocus={() => setFocusedInput('spf')}
                  onBlur={() => setFocusedInput('')}
                  onChange={(event) => updateForm('spf', event.target.value)}
                />
              </label>

              <DropdownField
                id="pouch-pa"
                label="PA"
                value={form.pa}
                options={paGrades}
                isOpen={openDropdown === 'pa'}
                onToggle={() => toggleDropdown('pa')}
                onSelect={(value) => selectDropdownValue('pa', value)}
              />
            </div>

            <button
              className={`mt-[18px] flex h-[53px] w-full items-center justify-center rounded-[14px] border-0 text-[15px] font-bold leading-[23px] transition-colors ${headingFontClass} ${
                canSubmitProduct
                  ? 'bg-[#1d2b44] text-white'
                  : 'bg-[#f0f2f6] text-[#91a4bf]'
              }`}
              type="button"
              disabled={!canSubmitProduct}
              onClick={handleSubmitProduct}
            >
              {isEditing ? '수정하기' : '+ 추가하기'}
            </button>
          </form>

          <section className="mt-[31px]">
            <h2
              className={`m-0 text-[17px] font-bold leading-6 tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
            >
              등록된 차단제
            </h2>

            {products.length > 0 ? (
              <div className="mt-[12px] rounded-[22px] bg-white p-4 shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
                <ul className="m-0 flex list-none flex-col gap-[8px] p-0">
                  {products.map((product) => (
                    <PouchProduct
                      key={product.id}
                      product={product}
                      selected={product.id === editingProductId}
                      onOpenActions={() => setActionProductId(product.id)}
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyRegisteredSunscreenState />
            )}
          </section>
        </main>

        <SunscreenActionSheet
          product={actionProduct}
          onClose={() => setActionProductId('')}
          onEdit={() => actionProduct && handleEditProduct(actionProduct)}
          onDelete={() => actionProduct && handleRemoveProduct(actionProduct.id)}
        />

        {showLimitNotice && (
          <ProductLimitNotice onClose={() => setShowLimitNotice(false)} />
        )}
      </section>
    </div>
  )
}

export default PouchEdit
