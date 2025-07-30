'use client'

interface TestChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function TestChatPanel({ isOpen, onClose }: TestChatPanelProps) {
  console.log('TestChatPanel render, isOpen:', isOpen)
  
  if (!isOpen) {
    console.log('TestChatPanel not rendering because isOpen is false')
    return null
  }

  return (
    <>
      {/* オーバーレイ背景 */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999998,
        }}
        onClick={onClose}
      />
      {/* パネル本体 */}
      <div 
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '400px',
          height: '100vh',
          backgroundColor: '#ff0000',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          cursor: 'pointer'
        }}
        onClick={onClose}
      >
        テストパネル - クリックで閉じる
      </div>
    </>
  )
}