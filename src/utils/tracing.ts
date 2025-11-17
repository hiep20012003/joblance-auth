// import { NodeSDK } from '@opentelemetry/sdk-node';
// // import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// // import {
// //   PeriodicExportingMetricReader,
// //   ConsoleMetricExporter,
// // } from '@opentelemetry/sdk-metrics';
// import { B3Propagator } from '@opentelemetry/propagator-b3';
//
// const sdk = new NodeSDK({
//   // traceExporter: new ConsoleSpanExporter(),
//   // metricReaders: [
//   //   new PeriodicExportingMetricReader({
//   //     exporter: new ConsoleMetricExporter(),
//   //   }),
//   // ],
//   instrumentations: [getNodeAutoInstrumentations()],
//   textMapPropagator: new B3Propagator(),
// });
//
//
// sdk.start();
//
