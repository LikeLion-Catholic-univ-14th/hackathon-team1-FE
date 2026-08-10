function InsightList({ analysis }) {
  const items = [
    { key: 'strongest', label: '가장 센 날', color: 'bg-[#e05252]', data: analysis.strongestDay },
    { key: 'missed', label: '놓친 날', color: 'bg-[#f5a623]', data: analysis.missedDays },
    { key: 'good', label: '잘한 날', color: 'bg-[#4caf80]', data: analysis.goodDays },
  ]

  return (
    <section className="mx-4 my-3 rounded-[20px] bg-white px-[18px] py-6">
      <p className="mb-4 text-[12px] text-[#8a9eb8]">상세 분석</p>

      {items.map((item) => (
        <div className="flex items-start gap-4 py-3" key={item.key}>
          <span className={`mt-0.5 block h-9 w-9 shrink-0 rounded-full ${item.color}`} />
          <div>
            <p className="text-[15px] font-semibold">
              {item.label} — {item.data.title}
            </p>
            <p className="mt-0.5 text-[13px] text-[#8a9eb8]">{item.data.description}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

export default InsightList