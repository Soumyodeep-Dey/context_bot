# Scalable VTT File Processing System

## Overview
This system is designed to handle 2000-3000 .vtt files efficiently with multiple processing strategies and optimizations.

## Key Features

### 1. VTT File Support
- **Custom VTT Loader**: Parses WebVTT format, extracts timestamps and text
- **Optimized Chunking**: Smaller chunks (500 chars) for VTT files vs 1000 for others
- **HTML Tag Removal**: Cleans subtitle text from HTML formatting

### 2. Batch Processing
- **Batch Upload API**: `/api/batch-upload` - Processes multiple files simultaneously
- **Memory Optimization**: Processes files in batches of 10 to prevent memory overflow
- **Progress Tracking**: Real-time progress updates during upload
- **Error Handling**: Individual file error tracking without stopping the entire batch

### 3. Background Job Queue
- **Queue System**: `/api/queue-upload` - Non-blocking file processing
- **Job Status Tracking**: Monitor processing status via job ID
- **Scalable Architecture**: Can be extended with Redis for production

### 4. Performance Optimizations

#### Memory Management
- **Streaming Processing**: Files processed in batches to avoid memory spikes
- **Garbage Collection**: Automatic cleanup between batches
- **Chunk Size Optimization**: Smaller chunks for VTT files reduce memory usage

#### Database Optimization
- **Batch Inserts**: Multiple documents inserted in single Qdrant operation
- **Metadata Optimization**: Efficient metadata structure for fast queries
- **Collection Sharding**: Ready for horizontal scaling with Qdrant

#### Network Optimization
- **Parallel Processing**: Multiple files processed simultaneously
- **Connection Pooling**: Reused Qdrant connections
- **Retry Logic**: Built-in error recovery

## Usage

### Single File Upload
```typescript
// Upload individual VTT file
const formData = new FormData();
formData.append('file', vttFile);
await fetch('/api/store-file', { method: 'POST', body: formData });
```

### Batch Upload
```typescript
// Upload multiple files at once
const formData = new FormData();
files.forEach(file => formData.append('files', file));
await fetch('/api/batch-upload', { method: 'POST', body: formData });
```

### Queue Upload (Recommended for Large Batches)
```typescript
// Queue files for background processing
const formData = new FormData();
files.forEach(file => formData.append('files', file));
const response = await fetch('/api/queue-upload', { method: 'POST', body: formData });
const { jobId } = await response.json();

// Check job status
const status = await fetch(`/api/queue-upload?jobId=${jobId}`);
```

## Scalability Strategies

### For 2000-3000 VTT Files

#### Option 1: Batch Processing (Recommended)
- **Batch Size**: 50-100 files per batch
- **Processing Time**: ~2-3 hours for 3000 files
- **Memory Usage**: ~2-4GB peak
- **Reliability**: High - individual file failures don't stop the process

#### Option 2: Queue Processing
- **Background Jobs**: Non-blocking processing
- **Scalability**: Can process unlimited files
- **Monitoring**: Real-time job status tracking
- **Recovery**: Failed jobs can be retried

#### Option 3: Distributed Processing
- **Multiple Workers**: Process files across multiple servers
- **Load Balancing**: Distribute load evenly
- **Fault Tolerance**: Worker failures don't affect other workers

## Performance Metrics

### Expected Performance for 3000 VTT Files
- **Total Processing Time**: 2-4 hours
- **Memory Usage**: 2-4GB peak
- **Storage**: ~500MB-1GB in Qdrant
- **Chunks Generated**: ~15,000-30,000 chunks
- **Embedding Cost**: ~$15-30 (OpenAI API)

### Optimization Tips
1. **Use Batch Upload** for files < 1000
2. **Use Queue Upload** for files > 1000
3. **Monitor Memory Usage** during processing
4. **Process During Off-Peak Hours** to avoid API rate limits
5. **Use Smaller Chunk Sizes** for VTT files (already optimized)

## Error Handling

### Common Issues
1. **Memory Overflow**: Reduce batch size
2. **API Rate Limits**: Add delays between batches
3. **File Format Errors**: VTT parser handles most formats
4. **Network Timeouts**: Built-in retry logic

### Recovery Strategies
1. **Resume Processing**: Failed batches can be retried
2. **Partial Success**: Individual file failures don't stop the batch
3. **Error Logging**: Detailed error messages for debugging
4. **Status Monitoring**: Real-time progress tracking

## Production Recommendations

### Infrastructure
- **Qdrant Cluster**: Use Qdrant Cloud for better performance
- **Redis Queue**: Replace in-memory queue with Redis
- **Load Balancer**: Distribute load across multiple instances
- **Monitoring**: Add Prometheus/Grafana for metrics

### Configuration
```typescript
// Optimized settings for large-scale processing
const BATCH_SIZE = 50; // Files per batch
const CHUNK_SIZE = 500; // Characters per chunk for VTT
const CHUNK_OVERLAP = 50; // Overlap between chunks
const MAX_CONCURRENT = 5; // Concurrent file processing
```

### Monitoring
- **Processing Rate**: Files per minute
- **Memory Usage**: Peak and average memory consumption
- **Error Rate**: Failed files percentage
- **Queue Length**: Pending jobs in queue

## Conclusion

This system provides multiple strategies for handling large-scale VTT file processing:

1. **Batch Processing**: Best for 100-1000 files
2. **Queue Processing**: Best for 1000+ files
3. **Distributed Processing**: Best for 5000+ files

The system is designed to be scalable, reliable, and efficient for processing thousands of VTT files while maintaining good performance and error handling.
