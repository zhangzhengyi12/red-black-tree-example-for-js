let tree = new RedBlackTree()
const rd = (start, end) => {
  return Math.floor(Math.random() * end - start + 1) + start
}
for (let i = 0; i < 20; i++) {
  tree.insert(i, i)
}

// 绘制
const canvas = document.querySelector('#canvas')
canvas.width = 5000
canvas.height = 2000
canvas.style.width = `5000px`
canvas.style.height = `2000px`
const ctx = canvas.getContext('2d')
const width = canvas.clientWidth
const height = canvas.clientHeight

const drawTree = () => {
  ctx.clearRect(0, 0, width, height)
  tree.draw(ctx, width, height)
  requestAnimationFrame(drawTree)
}

drawTree()
