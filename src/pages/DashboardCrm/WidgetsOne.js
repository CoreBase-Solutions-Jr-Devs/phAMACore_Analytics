import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CountUp from 'react-countup';
import { fetchDailyClosingStock, fetchStockMovements, fetchBatchExpiry } from '../../slices/dashboardCRM/thunk';
import { KPI_META, computeKPIs, getTodayApi, getNDaysAgoApi } from '../utils/StockInventoryUtils';

const WidgetsOne = () => {
    const dispatch = useDispatch();

    const { 
            dailyClosingStock = [], 
            stockMovements = [], 
            batchExpiry = [],
            loadingStock, loadingMovements, errorStock 
        } = useSelector((state) => state.StockInventory ?? {});

    useEffect(() => {
        // All items — no itemcode / suppliercode / manufucturercode params
        dispatch(fetchDailyClosingStock({
            clientid:   1,
            startDate:  '01/01/2026',
            endDate:    getTodayApi(),
            branchcode: 1,
        }));

        // 30-day window for Slow Movers KPI
        dispatch(fetchStockMovements({
            clientid:   1,
            startDate:  getNDaysAgoApi(30),
            endDate:    getTodayApi(),
            branchcode: 1,
            itemcode: 20007,
        }));

        // Batch Expiry data - Near Expiry KPI
        dispatch(fetchBatchExpiry({
            clientid:  1,
            startDate: "01/01/2026",
            endDate:   getTodayApi(),
            // branchcode: 1,
        }))
    }, [dispatch]);

    const kpis      = useMemo(() => 
        computeKPIs(dailyClosingStock, stockMovements, batchExpiry), 
            [dailyClosingStock, stockMovements, batchExpiry]
        );
    const isLoading = loadingStock || loadingMovements;

    return (
        <React.Fragment>
            <div className="col-xl-12">
                <div className="card crm-widget">
                    <div className="card-body p-0">
                        {errorStock && (
                            <div className="alert alert-danger m-3" role="alert">
                                {typeof errorStock === 'string' ? errorStock : 'Failed to load inventory data.'}
                            </div>
                        )}
                        <div className="row row-cols-xxl-5 row-cols-md-3 row-cols-1 g-0">
                            {KPI_META.map((widget) => (
                                <div className="col" key={widget.id}>
                                    <div className="py-4 px-3">
                                        <h5 className="text-muted text-uppercase fs-13">{widget.label}</h5>
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0">
                                                <i className={`${widget.icon} display-6`} />
                                            </div>
                                            <div className="flex-grow-1 ms-3">
                                                {isLoading ? (
                                                    <h2 className="mb-0 placeholder-glow">
                                                        <span className="placeholder col-6 rounded" />
                                                    </h2>
                                                ) : (
                                                    <h2 className="mb-0">
                                                        <CountUp
                                                            start={0}
                                                            end={kpis[widget.id] ?? 0}
                                                            prefix={widget.prefix}
                                                            suffix={widget.suffix}
                                                            separator={widget.separator}
                                                            decimals={widget.decimals}
                                                            duration={4}
                                                        />
                                                    </h2>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default WidgetsOne;