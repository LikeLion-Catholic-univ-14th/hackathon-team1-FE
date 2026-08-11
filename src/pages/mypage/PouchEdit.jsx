import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import sunscreenIcon01 from '../../assets/sunscreen/sunscreen-icon-01.svg'
import sunscreenIcon02 from '../../assets/sunscreen/sunscreen-icon-02.svg'
import sunscreenIcon03 from '../../assets/sunscreen/sunscreen-icon-03.svg'
import sunscreenIcon04 from '../../assets/sunscreen/sunscreen-icon-04.svg'
import sunscreenIcon05 from '../../assets/sunscreen/sunscreen-icon-05.svg'
import sunscreenIcon06 from '../../assets/sunscreen/sunscreen-icon-06.svg'
import moreVerticalIcon from '../../assets/icons/more-vertical.svg'
import statusBar from '../onboarding/assets/status-bar.svg'
import { saveOnboardingSunscreens } from '../onboarding/storage/onboardingProfileStorage.js'
import {
  getFallbackMyPageData,
  loadMyPageData,
} from './utils/myPageData.js'

const sunscreenTypes = ['선크림', '선스틱', '선스프레이']
const blockingMethods = ['유기자차', '무기자차', '혼합자차']
const paGrades = ['PA+', 'PA++', 'PA+++', 'PA++++']
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
  'h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] text-left font-[SF_Pro] text-[#1d2b44] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"
const labelClass = `mb-2 ml-1 block text-[14px] font-[590] uppercase leading-[16.5px] text-[#8a9eb8] ${headingFontClass}`
const controlClass = `box-border flex h-[46px] w-full items-center justify-between rounded-[10px] border-[1.276px] bg-white px-[14px] text-left text-[13px] font-normal leading-[19.5px] tracking-[0] text-[#1d2b44] outline-none ${headingFontClass}`

function SunscreenActionSheet({ product, onClose, onEdit, onDelete }) {
  if (!product) {
    return null
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
      >
        <span
          className="mx-auto mb-[29px] block h-[5px] w-[62px] rounded-full bg-[#e3e3e3]"
          aria-hidden="true"
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
              className={`h-11 w-full border-0 border-b border-[#eceef2] bg-white px-4 text-left text-[14px] font-[590] leading-5 tracking-[-1px] last:border-b-0 ${headingFontClass} ${
                value === option
                  ? 'bg-[#fff9ed] text-[#f5a623]'
                  : 'text-[#1d2b44]'
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

function PouchProduct({ product, selected, onOpenActions }) {
  return (
    <li className="relative">
      <div
        className={`grid min-h-[68px] w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-[12px] rounded-[14px] border px-[12px] py-[10px] text-left transition-colors ${
          selected
            ? 'border-[#f5a623] bg-[#fff9ed]'
            : 'border-[#eceef2] bg-[#f7f8fb]'
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
            className={`block truncate text-[12px] font-bold leading-[18px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
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
                className={`inline-flex h-[20px] items-center rounded-full border border-[#eceef2] bg-white px-[7px] text-[10px] font-[510] leading-[15px] tracking-[-0.4px] text-[#3a506b] ${headingFontClass}`}
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
    setActionProductId('')
  }

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <img
          className="h-[62px] w-full object-contain"
          src={statusBar}
          alt=""
          aria-hidden="true"
        />

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
            <input
              className={`box-border h-[48px] w-full rounded-[10px] border-[1.276px] bg-white px-4 font-[SF_Pro] text-[15px] font-normal leading-normal tracking-[-0.64px] text-[#1d2b44] outline-none placeholder:text-[rgba(29,43,68,0.5)] ${
                focusedInput === 'productName' || form.productName
                  ? 'border-[#f5a623]'
                  : 'border-[#eceef2]'
              }`}
              type="text"
              value={form.productName}
              placeholder="제품명을 입력해주세요"
              onFocus={() => setFocusedInput('productName')}
              onBlur={() => setFocusedInput('')}
              onChange={(event) => updateForm('productName', event.target.value)}
            />

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
                    focusedInput === 'spf' || form.spf
                      ? 'border-[#f5a623]'
                      : 'border-[#eceef2]'
                  }`}
                  type="number"
                  min="0"
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
              className={`m-0 text-[17px] font-bold leading-6 tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
            >
              등록된 차단제
            </h2>

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
          </section>
        </main>

        <SunscreenActionSheet
          product={actionProduct}
          onClose={() => setActionProductId('')}
          onEdit={() => actionProduct && handleEditProduct(actionProduct)}
          onDelete={() => actionProduct && handleRemoveProduct(actionProduct.id)}
        />
      </section>
    </div>
  )
}

export default PouchEdit
