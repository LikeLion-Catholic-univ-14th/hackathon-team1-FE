import { useRef, useState } from 'react'
import sunscreenIcon01 from '../../assets/sunscreen/sunscreen-icon-01.svg'
import sunscreenIcon02 from '../../assets/sunscreen/sunscreen-icon-02.svg'
import sunscreenIcon03 from '../../assets/sunscreen/sunscreen-icon-03.svg'
import sunscreenIcon04 from '../../assets/sunscreen/sunscreen-icon-04.svg'
import sunscreenIcon05 from '../../assets/sunscreen/sunscreen-icon-05.svg'
import sunscreenIcon06 from '../../assets/sunscreen/sunscreen-icon-06.svg'
import moreVerticalIcon from '../../assets/icons/more-vertical.svg'
import OnboardingStatusBar from './components/OnboardingStatusBar.jsx'
import {
  findSunscreenProductByName,
  mockSunscreenProducts,
} from './mocks/mockSunscreenProducts.js'

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
const emptySunscreen = {
  form: {
    productName: '',
    type: '선크림',
    blockingMethod: '유기자차',
    spf: '',
    pa: 'PA+',
  },
  products: [],
}

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] text-left font-[SF_Pro] text-[15px] font-normal leading-normal tracking-[0] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"
const sunscreenLabelClass = `mb-2 ml-1 block text-[14px] font-[590] uppercase leading-[16.5px] text-[#8a9eb8] ${headingFontClass}`
const sunscreenControlClass = `box-border flex h-[52px] w-full items-center justify-between rounded-[10px] border-[1.276px] bg-white px-4 text-left text-[13px] font-normal leading-[19.5px] tracking-[0] text-[#1d2b44] outline-none ${headingFontClass}`

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
      <label className={sunscreenLabelClass} htmlFor={id}>
        {label}
      </label>
      <button
        className={`${sunscreenControlClass} ${
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
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-xl border border-[#eceef2] bg-white shadow-[0_8px_24px_0_rgba(29,43,68,0.12)]">
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
        className={`box-border h-[54px] w-full rounded-[10px] border-[1.276px] bg-white px-4 font-[SF_Pro] text-[15px] font-normal leading-normal tracking-[-0.64px] text-[#1d2b44] outline-none placeholder:text-[rgba(29,43,68,0.5)] focus:border-[#eceef2] ${
          value ? 'border-[#f5a623]' : 'border-[#eceef2]'
        } ${shouldShowSuggestions ? 'rounded-b-none' : ''}`}
        type="text"
        value={value}
        placeholder="제품명을 입력해주세요"
        autoComplete="off"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(event) => {
          setIsFocused(true)
          onChange(event.target.value)
        }}
      />

      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-[53px] z-20 overflow-hidden rounded-b-[10px] border-x-[1.276px] border-b-[1.276px] border-[#eceef2] bg-white shadow-[0_8px_18px_0_rgba(29,43,68,0.08)]">
          {filteredSuggestions.map((productName) => {
            const isExactMatch = productName.toLowerCase() === query

            return (
              <button
                className={`block h-[48px] w-full border-0 border-b border-[#eceef2] px-4 text-left text-[14px] font-normal leading-[20px] tracking-[-0.64px] last:border-b-0 ${headingFontClass} ${
                  isExactMatch
                    ? 'bg-[#FFFBF2] text-[#F5A623]'
                    : 'bg-white text-[#1d2b44]'
                }`}
                key={productName}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(productName)
                  setIsFocused(false)
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

function SunscreenSetup({
  value,
  onChange,
  onBack,
  onComplete,
  sunscreenProductOptions = mockSunscreenProducts,
}) {
  const formRef = useRef(null)
  const [openDropdown, setOpenDropdown] = useState('')
  const [isSpfFocused, setIsSpfFocused] = useState(false)
  const [localSunscreen, setLocalSunscreen] = useState(emptySunscreen)
  const [editingProductId, setEditingProductId] = useState('')
  const [actionProductId, setActionProductId] = useState('')
  const sunscreen = value ?? localSunscreen
  const form = sunscreen.form
  const products = sunscreen.products
  const actionProduct = products.find((product) => product.id === actionProductId)
  const isEditing = Boolean(editingProductId)

  const updateSunscreen = (updater) => {
    const nextSunscreen =
      typeof updater === 'function' ? updater(sunscreen) : updater

    if (value === undefined) {
      setLocalSunscreen(nextSunscreen)
    }

    onChange?.(nextSunscreen)
  }

  const canSubmitProduct = Boolean(
    form.productName.trim() &&
      form.type &&
      form.blockingMethod &&
      form.spf.trim() &&
      form.pa,
  )
  const canContinue = products.length > 0

  const updateForm = (field, value) => {
    updateSunscreen((prevSunscreen) => ({
      ...prevSunscreen,
      form: {
        ...prevSunscreen.form,
        [field]: value,
      },
    }))
  }

  const handleProductNameSelect = (productName) => {
    const product = findSunscreenProductByName(productName)

    if (!product) {
      updateForm('productName', productName)
      return
    }

    updateSunscreen((prevSunscreen) => ({
      ...prevSunscreen,
      form: {
        ...prevSunscreen.form,
        productName: product.productName,
        type: product.type,
        blockingMethod: product.blockingMethod,
        spf: product.spf,
        pa: product.pa,
      },
    }))
  }

  const toggleDropdown = (name) => {
    setOpenDropdown((currentName) => (currentName === name ? '' : name))
  }

  const selectDropdownValue = (field, value) => {
    updateForm(field, value)
    setOpenDropdown('')
  }

  const handleSubmitProduct = () => {
    if (!canSubmitProduct) {
      return
    }

    const productSpf = form.spf.trim()

    if (isEditing) {
      updateSunscreen((prevSunscreen) => ({
        ...prevSunscreen,
        form: {
          ...prevSunscreen.form,
          productName: '',
        },
        products: prevSunscreen.products.map((product) =>
          product.id === editingProductId
            ? {
                ...product,
                ...form,
                productName: form.productName.trim(),
                spf: productSpf,
              }
            : product,
        ),
      }))
      setEditingProductId('')
      setActionProductId('')
      setOpenDropdown('')
      return
    }

    const randomIcon =
      sunscreenIcons[Math.floor(Math.random() * sunscreenIcons.length)]

    updateSunscreen((prevSunscreen) => ({
      ...prevSunscreen,
      form: {
        ...prevSunscreen.form,
        productName: '',
      },
      products: [
        ...prevSunscreen.products,
        {
          id: crypto.randomUUID(),
          ...form,
          productName: form.productName.trim(),
          spf: productSpf,
          icon: randomIcon,
        },
      ],
    }))
    setOpenDropdown('')
  }

  const handleEditProduct = (product) => {
    updateSunscreen((prevSunscreen) => ({
      ...prevSunscreen,
      form: {
        ...prevSunscreen.form,
        productName: product.productName,
        type: product.type,
        blockingMethod: product.blockingMethod,
        spf: product.spf,
        pa: product.pa,
      },
    }))
    setEditingProductId(product.id)
    setActionProductId('')
    setOpenDropdown('')
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDeleteProduct = (productId) => {
    updateSunscreen((prevSunscreen) => ({
      ...prevSunscreen,
      form:
        editingProductId === productId ? emptySunscreen.form : prevSunscreen.form,
      products: prevSunscreen.products.filter((item) => item.id !== productId),
    }))

    if (editingProductId === productId) {
      setEditingProductId('')
    }

    setActionProductId('')
  }

  const handleContinue = () => {
    if (!canContinue) {
      return
    }

    onComplete?.(products)
  }

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <OnboardingStatusBar />

        <div className="box-border px-6 pb-[30px] pt-5">
          <button
            className="flex h-6 w-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
            type="button"
            aria-label="이전 화면으로 돌아가기"
            onClick={onBack}
          >
            <span
              className="h-[10px] w-[10px] rotate-45 border-b-[2.4px] border-l-[2.4px] border-[#1d2b44]"
              aria-hidden="true"
            />
          </button>

          <header className="ml-[10px] mt-[34px]">
            <h1
              className={`m-0 text-[28px] font-bold leading-9 tracking-[-1px] text-[#1d2b44] ${headingFontClass}`}
            >
              지금 갖고 계신
              <br />
              자외선 차단제를 알려주세요!
            </h1>

            <div
              className="mt-[34px] flex items-center justify-center gap-[5px]"
              aria-label="온보딩 진행 단계"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <span
                  className={`h-[6px] rounded-full border-0 p-0 transition-[width,background-color] ${
                    index === 1
                      ? 'w-5 bg-[#f6a51a]'
                      : 'w-[6px] bg-[#edf1f6]'
                  }`}
                  key={index}
                  aria-hidden="true"
                />
              ))}
            </div>
          </header>

          <form
            className="mb-8 mt-8 box-border w-full rounded-[22px] bg-white p-5 shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]"
            ref={formRef}
          >
            <ProductNameField
              value={form.productName}
              suggestions={sunscreenProductOptions}
              onChange={(productName) => updateForm('productName', productName)}
              onSelect={handleProductNameSelect}
              onFocus={() => setOpenDropdown('')}
            />

            <div className="mt-[26px] grid grid-cols-2 gap-x-3 gap-y-[23px]">
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
                <label className={sunscreenLabelClass} htmlFor="sunscreen-spf">
                  SPF
                </label>
                <input
                  className={`box-border flex h-[52px] w-full items-center rounded-[10px] border-[1.276px] bg-white px-4 font-[SF_Pro] text-[15px] font-normal leading-normal tracking-[-0.64px] outline-none placeholder:text-[rgba(29,43,68,0.5)] focus:border-[#f5a623] ${
                    form.spf
                      ? 'border-[#eceef2] text-[#1d2b44]'
                      : 'border-[#eceef2] text-[rgba(29,43,68,0.5)]'
                  }`}
                  id="sunscreen-spf"
                  inputMode="numeric"
                  type="text"
                  value={form.spf}
                  placeholder={isSpfFocused ? '' : '50'}
                  onFocus={() => setIsSpfFocused(true)}
                  onBlur={() => setIsSpfFocused(false)}
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
              className={`mt-7 box-border h-[53px] w-full rounded-[14px] border-0 text-[15px] font-bold leading-[23px] ${headingFontClass} ${
                canSubmitProduct
                  ? 'cursor-pointer bg-[#1d2b44] text-white'
                  : 'cursor-default bg-[#f0f2f6] text-[#91a4bf]'
              }`}
              type="button"
              disabled={!canSubmitProduct}
              onClick={handleSubmitProduct}
            >
              {isEditing ? '수정하기' : '+ 추가하기'}
            </button>

            {products.length > 0 && (
              <div
                className="mt-7 grid gap-3"
                aria-label="추가한 차단제"
              >
                {products.map((product) => (
                  <div
                    className="relative box-border grid min-h-[86px] grid-cols-[50px_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-2xl border-[1.276px] border-[#eceef2] bg-[#f7f8fb] p-[14px] shadow-[0_4px_12px_0_rgba(29,43,68,0.04)]"
                    key={product.id}
                  >
                    <span className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-white shadow-[0_4px_14px_0_rgba(29,43,68,0.08)]">
                      <img
                        className="h-7 w-7 object-contain"
                        src={product.icon ?? sunscreenIcon01}
                        alt=""
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0 overflow-hidden">
                      <strong
                        className={`block overflow-hidden text-ellipsis whitespace-nowrap pr-[26px] text-[14px] font-bold leading-5 tracking-[-1px] text-[#1d2b44] ${headingFontClass}`}
                      >
                        {product.productName}
                      </strong>
                      <div className="mt-2 flex max-w-full flex-wrap gap-[2px]">
                        {[product.type, product.blockingMethod, `SPF ${product.spf}`, product.pa].map(
                          (tag) => (
                            <span
                              className={`box-border inline-flex h-6 max-w-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-[#eceef2] bg-white px-[7px] py-[3px] text-[11px] font-[510] leading-[16.5px] tracking-[-0.64px] text-[#3a506b] ${headingFontClass}`}
                              key={tag}
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <button
                      className="absolute right-4 top-[18px] flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
                      type="button"
                      aria-label={`${product.productName} 수정 또는 삭제 메뉴 열기`}
                      onClick={() => setActionProductId(product.id)}
                    >
                      <img
                        className="h-[15px] w-[3px] object-contain"
                        src={moreVerticalIcon}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-[27px] grid grid-cols-[0.8fr_1.2fr] gap-[10px]">
              <button
                className={`box-border h-[53px] cursor-pointer rounded-2xl border-[1.276px] border-[#f5a623] bg-white text-[15px] font-bold leading-[23px] text-[#8a9eb8] ${headingFontClass}`}
                type="button"
                onClick={() => onComplete?.([])}
              >
                건너뛰기
              </button>
              <button
                className={`box-border h-[53px] rounded-2xl border-0 text-[15px] font-bold leading-[23px] ${headingFontClass} ${
                  canContinue
                    ? 'cursor-pointer bg-[#f5a623] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)]'
                    : 'cursor-default bg-[#f0f2f6] text-[#91a4bf]'
                }`}
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                저장하고 계속
              </button>
            </div>
          </form>
        </div>

        <SunscreenActionSheet
          product={actionProduct}
          onClose={() => setActionProductId('')}
          onEdit={() => actionProduct && handleEditProduct(actionProduct)}
          onDelete={() => actionProduct && handleDeleteProduct(actionProduct.id)}
        />
      </section>
    </div>
  )
}

export default SunscreenSetup
