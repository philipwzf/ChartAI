import React, {useState} from 'react';
import {genChartByAiUsingPOST} from "@/services/chartAI/chartController";
import {UploadOutlined} from '@ant-design/icons';

import {Button, Card, Col, Divider, Form, Input, message, Row, Select, Space, Spin, Upload,} from 'antd';
import TextArea from "antd/es/input/TextArea";
import ReactECharts from 'echarts-for-react';


const AddChart: React.FC = () => {
  const {Option} = Select;
  const[chart,setChart] = useState<API.BiResponse>();
  const[options, setOptions] = useState<any>();
  const [submitting,setSubmitting] = useState<boolean>();

  const onFinish = async (values: any) => {
      //if the file is already uploading, no need to resubmit
      if(submitting){
          return;
      }
      //Set submitting to be true
      setSubmitting(true);
      setChart(undefined);
      setOptions(undefined);

    const params = {
      ...values,
      file: undefined,
    };
    try{
      const res = await genChartByAiUsingPOST(params,{},values.file.file.originFileObj);
      if(!res?.data){
        message.error('Analyses Failed. Data is empty');
      }else{
        message.success('Analyses Succeed');
        const str = res.data.genChart ?? "";
        const modifiedStr = str
          .replace(/'/g, '"');
        const chartOption = JSON.parse(modifiedStr);

          // const chartOption = JSON.parse(res.data.genChart ?? "");
        if(!chartOption){
            throw new Error('Chart Source Code Error');
        }else{
            setChart(res.data);
            setOptions(chartOption);
        }
      }
    }catch(e:any){
      message.error('Analyses Failed: ' + e.message);
    }
    //after the submission, set it back to false
    setSubmitting(false);
  };

  return (
    <div className={"add-chart"}>
      <Row gutter={24}>
        <Col span={12}>
          <Card title="Chart AI">
            <Form
              name="addChart"
              onFinish={onFinish}
              initialValues={{ }}
              style={{ maxWidth: 600 }}
            >

              {/*Goal Input*/}
              <Form.Item name="goal" label="Goal" rules={[{required: true, message:"Please put in the Goal for analysis!"}]}>
                <TextArea placeholder="Please put int the Goal for analysis, for example: Analyze the User Trend"/>
              </Form.Item>

              {/*Name Input*/}
              <Form.Item name="name" label="Chart Name">
                <Input placeholder="Please input the chart name"/>
              </Form.Item>

              {/*Chart Type Input   */}
              <Form.Item
                name="chartType"
                label="Chart Type"
              >
                <Select>
                  <Option value="PieChart">Pie Chart</Option>
                  <Option value="BarChart">Bar Chart</Option>
                  <Option value="LineChart">Line Chart</Option>
                  <Option value="ScatterPlot">Scatter Plot</Option>
                  <Option value=""> Empty the Field</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="file"
                label="Date"
              >
                <Upload name="file">
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>

              <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                  <Button htmlType="reset">reset</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Generate Result">
            {chart?.genResult ?? <div>Please submit data on the left</div>}
            <Spin spinning={submitting}/>
          </Card>
          <Divider/>
          <Card title="Generated Graph">
            {options ? (
              <ReactECharts option={options}/>
            ) : (
              <p>No Data provided</p>
            )}
            <Spin spinning={submitting}/>
          </Card>
        </Col>
      </Row>


    </div>
  );
};

export default AddChart;
