<script setup lang="ts">
import axios from 'axios';
import { ref } from '@vue/reactivity'
// 单个切片大小 1MB
const SIZE = 1 * 1024
// 获取Dom
const upload = ref()

// 创建切片数组
const createFileChunkList = (file: File, size = SIZE) => {
  const chunkList = []
  let cur = 0
  while (cur < file.size) {
    chunkList.push({ file: file.slice(cur, cur + size) })
    cur += size
  }
  return chunkList
}
// 合并指定名称的切片
const merge = (fileName: string, format: string) => {
  return axios.post(`http://localhost:3000/merge`, { fileName, format })
}
// 循环发送切片
const submit = async () => {
  console.log(upload.value?.files[0])
  const file = upload.value?.files[0]

  const chunkList = createFileChunkList(file)
  const fileName = file.name.substring(0, file.name.indexOf('.'))
  const requestList = chunkList.map((item, index) => {
    const data = new FormData()
    data.append('file', item.file)
    data.append('name', fileName)
    data.append('hash', '' + index)
    axios.post('http://localhost:3000/upload', data)
  })
  // 并发控制切片请求
  await Promise.all(requestList)
  // 发送完成后主动通知后端合并切片
  await merge(fileName, file.name.substring(file.name.indexOf('.'), file.name.length))
}

</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <div>
    <input type="file" ref="upload">
    <button @click="submit">上传</button>
  </div>
</template>
