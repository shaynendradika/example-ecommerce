import { PlusOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useState } from 'react';
import type { CatalogImage } from '@/types/catalog';

type Props = {
    images: CatalogImage[];
    maxCount?: number;
    onChange: (uploads: File[], removedIds: number[]) => void;
};

export default function ImageUpload({
    images,
    maxCount = 10,
    onChange,
}: Props) {
    const [fileList, setFileList] = useState<UploadFile[]>(
        images.map((image) => ({
            uid: `existing-${image.id}`,
            name: `Image ${image.id}`,
            status: 'done',
            url: image.url,
        })),
    );

    const handleChange: UploadProps['onChange'] = ({ fileList: next }) => {
        setFileList(next);
        onChange(
            next.flatMap((file) =>
                file.originFileObj ? [file.originFileObj] : [],
            ),
            images
                .filter(
                    (image) =>
                        !next.some(
                            (file) => file.uid === `existing-${image.id}`,
                        ),
                )
                .map((image) => image.id),
        );
    };

    return (
        <Upload
            listType="picture-card"
            accept="image/jpeg,image/png,image/webp"
            multiple={maxCount > 1}
            maxCount={fileList.length > maxCount ? undefined : maxCount}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleChange}
        >
            {fileList.length < maxCount && (
                <span>
                    <PlusOutlined /> Add images
                </span>
            )}
        </Upload>
    );
}
