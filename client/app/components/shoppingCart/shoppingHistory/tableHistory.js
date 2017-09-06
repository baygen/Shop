import React from "react";
import axios from 'axios'
import {browserHistory} from 'react-router'

// Import React Table
import { BootstrapTable, TableHeaderColumn} from  'react-bootstrap-table';
// import Popup from 'react-popup'
import '../css/react-bootstrap-table-all.min.css';

function priceFormatter(cell, row) {
    console.log(cell)
    return ` ${cell} UAH`;
}



export default class TableHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      purchases: [],
      loading : false,
      totalSize : 0,
      currentPage : 1,
      sizePerPage : 10,
      id : '',
      field : 'purchasedDate',
      sortOrder : 'desc'
    };
    this.onSizePerPageList = this.onSizePerPageList.bind(this)
    this.onPageChange = this.onPageChange.bind(this)
    this.onSortChange = this.onSortChange.bind(this)
    this.pop = this.pop.bind(this)
  }

componentWillMount(){
    
        this.setState({ loading : true })
        axios.post('/shoppinghistory').then(res=>{
            if(res.data){
              console.log(res.data.dataLength)
                this.setState({ purchases : res.data.purchases, 
                  loading : false, 
                  totalSize : res.data.dataLength })
            }
            this.setState({ loading : false })
        })
}

onSortChange(sortName, sortOrder) {
  const beginOffset = (this.state.currentPage - 1) * this.state.sizePerPage;
  const endOffset = beginOffset + this.state.sizePerPage;
  let params = {
        beginOffset : beginOffset,
        endOffset : endOffset,
        field : sortName,
        order : sortOrder
      }

  axios.post(`/shoppinghistory`,params).then( res => 
      this.setState({
          field : sortName,
          sortOrder : sortOrder,
          purchases : res.data.purchases,
          totalSize : res.data.dataLength
      })
  )
}

onPageChange(page, sizePerPage) {
  const beginOffset = (page - 1) * sizePerPage;
  const endOffset = beginOffset+sizePerPage;
  let data={
    beginOffset : beginOffset,
    endOffset : endOffset,
    field : this.state.field,
    order : this.state.sortOrder
  }
  axios.post(`/shoppinghistory`, data ).then( res => 
          this.setState({
                purchases : res.data.purchases,
                currentPage : page,
                totalSize : res.data.dataLength
          })
  )
}

onSizePerPageList( sizePerPage ) {
  const beginOffset = (this.state.currentPage - 1) * sizePerPage;
  const endOffset = beginOffset + sizePerPage;
  let data = {
    beginOffset : beginOffset,
    endOffset : beginOffset+sizePerPage,
    field : this.state.field,
    order : this.state.sortOrder
  }
  axios.post(`/shoppinghistory`, data ).then( res => 
    this.setState({
          totalSize : res.data.dataLength,
          purchases : res.data.purchases,
          sizePerPage : sizePerPage
    })
  )
}

pop (row ){
  console.log(`You click row id: ${row._id} with price is: ${row.purchasesSum}`);
  browserHistory.push(`shoppinghistory/${row._id}`)
}

  render() {

    const { purchases, loading , popup, totalSize} = this.state;
    const tableHeight = ( 39 * (this.state.sizePerPage + 1)) + 'px';

    const options = {
      sizePerPageList: [ {
          text: '5', value: 5
        }, {
          text: '10', value: 10
        }, {
          text: 'All', value: totalSize
        } ],
        sizePerPage : this.state.sizePerPage,
        onPageChange : this.onPageChange,
        page : this.state.currentPage,
        onSizePerPageList : this.onSizePerPageList,
        paginationPosition : 'top',
        onSortChange : this.onSortChange,
        onRowClick : this.pop 
    };
    
    const selectRowProp = {
        mode: 'radio',
        bgColor: 'grey', 
        hideSelectColumn: true,
        clickToSelect: true 
      };

    return (
      
        <div>{ loading ? <div className="col-sm-12 col-md-10 col-md-offset-5"> Loading data...</div> :
              <BootstrapTable data = { purchases } 
                              striped = { true }
                              pagination = { true }
                              remote = { true }
                              fetchInfo = { { dataTotalSize: this.state.totalSize } }
                              options = {options} 
                              selectRow={ selectRowProp }
                              containerStyle={ { height : tableHeight } }
                              >
                  <TableHeaderColumn isKey={true} dataField='_id' dataSort={ true }>Order ID</TableHeaderColumn>
                  <TableHeaderColumn dataField='purchasedDate' dataSort={ true } >Date</TableHeaderColumn>
                  <TableHeaderColumn dataField='status' dataSort = { true } >Status</TableHeaderColumn>
                  <TableHeaderColumn dataField='purchasesSum' dataSort={ true } >Order Price</TableHeaderColumn>
              </BootstrapTable>}
        </div>
    );
  }
}

