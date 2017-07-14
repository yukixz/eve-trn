import React, { Component } from 'react'
import { Input, Segment, Table } from 'semantic-ui-react'
import trn from './trn.txt'
import './App.css'
const DISPLAY_MAX_INDEX = 20

class App extends Component {
  state = {
    rows: [],
    keyword: '',
  }

  init = async () => {
    const resp = await fetch(trn)
    const data = await resp.text()
    const rows = data.split('\n').map((r, i) => {
      const p = r.split('\t')
      return {
        id: i,
        str: r.toLowerCase(),
        en: p[0],
        zh: p[1],
      }
    })
    this.setState({rows})
  }

  handleKeyword = (evt, data) => {
    this.setState({
      keyword: data.value || '',
    })
  }

  componentDidMount() {
    this.init()
  }

  render() {
    const allRows = this.state.rows
    const keyword = this.state.keyword.toLowerCase()
    const mthRows = allRows.filter(r => r.str.includes(keyword))
    const dspRows = mthRows.slice(0, mthRows.length < DISPLAY_MAX_INDEX ? mthRows.length : DISPLAY_MAX_INDEX)
    const hideNum = mthRows.length - dspRows.length

    return (
      <div className="App">
        <Table compact striped selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan='2' textAlign='right' active>
                <span>{mthRows.length} / {allRows.length}</span>
                <Input placeholder='Search' onChange={this.handleKeyword}
                       icon='search' autoFocus />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
          {dspRows.map(row => (
            <Table.Row key={row.id}>
              <Table.Cell>{row.en}</Table.Cell>
              <Table.Cell>{row.zh}</Table.Cell>
            </Table.Row>
          ))
          }
          {hideNum > 0 ? (
            <Table.Row disabled key={Number.MAX_SAFE_INTEGER} className='more'>
              <Table.Cell colSpan='2'>{hideNum} more...</Table.Cell>
            </Table.Row>
          ) : null}
          </Table.Body>
        </Table>

        <footer>
          <p className="inner">Dazzy Ding | <a href="https://github.com/wxt2005/bangumi-list">Github</a></p>
        </footer>
      </div>
    )
  }
}

export default App
