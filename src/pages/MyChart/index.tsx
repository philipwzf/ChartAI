import React, {useEffect, useState} from 'react';
import {listChartByPageUsingPOST} from "@/services/chartAI/chartController";
import {Card, message} from "antd";

import { Avatar, List} from 'antd';
import ReactECharts from "echarts-for-react";
import {useModel} from "@umijs/max";
import Search from "antd/es/input/Search";


const MyChart: React.FC = () => {
  //set an init value so we can restore later
  const initSearchParams = {
    current: 1,
    //Initial page should return 12 rows/page
    pagesize: 4,
  };

  const [searchParams,setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams });

  //get the user login info
  const{ initialState} = useModel('@@initialState');
  const{ currentUser } = initialState ?? {};
  const [chartList, setChartList] = useState<API.Chart[]>();
  const[total, setTotal] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const loadData = async() =>{
    setLoading(true);
    try{
      const res = await listChartByPageUsingPOST(searchParams);
      if(res.data){
        setChartList(res.data.records??[]);
        setTotal(res.data.total??0);

        //some has names and others dont
      }else{
        message.error("Failed to get my charts");
      }
    } catch(e:any){
      message.error("Failed to get my charts" + e.message);
    }
    setLoading(false);

  };
  useEffect(()=> {
    loadData();
  },[searchParams]);

  return (
    <div className={"my-chart-page"}>
        <div>
            <Search placeholder="Please putin the Chart name" enterButton loading={loading} onSearch={(value)=>{
              setSearchParams({
                  ...initSearchParams,
                  name: value,
              })
            }}/>
        </div>
        <div className="margin-16"/>
      <List
          grid={{
            gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 2,
              xxl: 2,
          }}
        pagination={{
          onChange: (page,pageSize) => {
            setSearchParams({
                ...searchParams,
                current: page,
                pageSize,
            })
          },
            current: searchParams.current,
            pagesize: searchParams.pageSize,
            total: total,
        }}
        loading = {loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item
            key={item.id}
          >
              <Card style={{width:'100%'}}>
            <List.Item.Meta
              avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
              title={item.name ?? 'NULL NAME'}
              description={item.chartType ? 'Chart Type: ' + item.chartType:undefined}
            />
              <div style={{marginBottom: 16}}/>
              <p>{'Goal: ' + item.goal}</p>
              <div style={{marginBottom: 16}}/>
              <ReactECharts option={JSON.parse((item.genChart??'{}').replace(/'/g, '"'))}/>
              </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default MyChart;
